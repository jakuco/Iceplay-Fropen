import { eq } from "drizzle-orm";
import { getDb } from "../../data/drizzle/db";
import { users } from "../../data/drizzle/modelos/schema";
import { LoginUserDto, RegisterUserDto, UserEntity } from "$domain";
import { ServiceError } from "$domain/errors";
import { JwtAdapter, bcryptAdapter } from "$config";
import { EmailService } from "./email.service";
import { envs } from "../../config/envs";
import { Result, ok, fail } from "../../config/result";
import { Status } from "../../config/status";

type AuthResponse = { user: Omit<UserEntity, "password">; token: string };
type TokenPayload = { id: string; email: string };

function toUserEntity(row: typeof users.$inferSelect): UserEntity | null {
  const result = UserEntity.fromObject({
    id: row.id.toString(),
    name: row.name,
    email: row.email,
    emailValidated: row.emailValidated ? "true" : "false",
    password: row.password,
    role: [row.role],
    img: row.img ?? undefined,
  });
  return result.ok ? result.value : null;
}

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto): Promise<Result<AuthResponse, ServiceError>> {
    const db = getDb();

    const existing = await db.query.users.findFirst({ where: eq(users.email, registerUserDto.email) });
    if (existing) return fail({ code: Status.BAD_REQUEST, message: "Email already in use" });

    try {
      const hashed = await bcryptAdapter.hash(registerUserDto.password);

      const [user] = await db.insert(users).values({
        name: (registerUserDto as any).name,
        email: registerUserDto.email,
        password: hashed,
        emailValidated: false,
        role: "USER_ROLE",
      }).returning();

      const token = await JwtAdapter.generateToken<TokenPayload>({ id: user.id.toString(), email: user.email });
      if (!token) return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });

      const emailResult = await this.sendEmailValidationLink(user.email);
      if (!emailResult.ok) return emailResult;

      const entity = toUserEntity(user);
      if (!entity) return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });

      const { password, ...userEntity } = entity;
      return ok({ user: userEntity, token });
    } catch (err) {
      console.error(err);
      return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });
    }
  }

  public async loginUser(loginUserDto: LoginUserDto): Promise<Result<AuthResponse, ServiceError>> {
    const db = getDb();
    const { email, password } = loginUserDto;

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return fail({ code: Status.BAD_REQUEST, message: "User or password are invalid" });

    const isPasswordValid = await bcryptAdapter.compare(password, user.password);
    if (!isPasswordValid) return fail({ code: Status.BAD_REQUEST, message: "User or password are invalid" });

    const entity = toUserEntity(user);
    if (!entity) return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });

    const { password: _, ...userEntity } = entity;
    const token = await JwtAdapter.generateToken<TokenPayload>({ id: user.id.toString(), email: user.email });
    if (!token) return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });

    return ok({ user: userEntity, token });
  }

  private async sendEmailValidationLink(email: string): Promise<Result<void, ServiceError>> {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });

    const link = `${envs.WEB_SERVICE_URL}/auth/validate-email/${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Verifica tu dirección de correo electrónico</h2>
        <p>Haz clic en el botón para verificar tu correo:</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Verificar correo</a>
        <p>O copia: <a href="${link}">${link}</a></p>
      </div>
    `;

    const isSent = await this.emailService.sendEmail({ to: email, subject: "Verificación de correo", htmlBody: html });
    if (!isSent) return fail({ code: Status.SERVICE_UNAVAILABLE, message: "Mail service unavailable" });

    return ok();
  }

  public async validateEmail(token: string): Promise<Result<void, ServiceError>> {
    const db = getDb();

    const payload = await JwtAdapter.verifyToken<{ email: string }>(token);
    if (!payload) return fail({ code: Status.UNAUTHORIZED, message: "Invalid token" });

    const { email } = payload;
    if (!email) return fail({ code: Status.BAD_REQUEST, message: "Email not in token" });

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      console.warn("User not found");
      return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });
    }

    await db.update(users).set({ emailValidated: true }).where(eq(users.id, user.id));
    return ok();
  }

  public async renewToken(user: UserEntity): Promise<Result<string, ServiceError>> {
    const newToken = await JwtAdapter.generateToken<TokenPayload>({ id: user.id, email: user.email });
    if (!newToken) return fail({ code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" });
    return ok(newToken);
  }
}
