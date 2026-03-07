import { UserModel } from "$data/mongo/models/user.model";
import { LoginUserDto, RegisterUserDto, UserEntity } from "$domain";
import { ServiceError } from "$domain/errors";
import { JwtAdapter, bcryptAdapter } from "$config";
import { EmailService } from "./email.service";
import { envs } from "$config/envs";
import { Result } from "$config/utils";
import { Status } from "$config/status";

type AuthResponse = { user: Omit<UserEntity, 'password'>, token: string }

export class AuthService {
    constructor(
        //DI - Email Service
        private readonly emailService: EmailService

    ) { }

    public async registerUser(registerUserDto: RegisterUserDto): Promise<Result<AuthResponse, ServiceError>> {
        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) {
            return { ok: false, error: { code: Status.BAD_REQUEST, message: "Email already in use" } }
        }

        try {
            const user = new UserModel(registerUserDto);

            //TODO: Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();

            //TODO: JWT para mantener la autenticación del usuario
            const token = await JwtAdapter.generateToken({ id: user._id.toString() });

            if (!token) {
                return { ok: false, error: { code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" } }
            }

            //TODO: Enviar correo de verificacion de JWT
            const emailResult = await this.sendEmailValidationLink(user.email)

            if (!emailResult.ok) {
                return emailResult; // Already a valid `Result`
            }

            //? Devolver el usuario sin la contraseña
            const { password, ...userEntity } = UserEntity.fromObject(user);
            return { ok: true, value: { user: userEntity, token }};

        } catch (err) {
            console.error(err);
            return { ok: false, error: { code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" } }
        }
    }

    public async loginUser(loginUserDto: LoginUserDto): Promise<Result<AuthResponse, ServiceError>> {
        const { email, password } = loginUserDto;

        //? Buscar el usuario por email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return { ok: false, error: { code: Status.BAD_REQUEST, message: "User not found" } }
        }

        //? Comparar la contraseña
        const isPasswordValid = bcryptAdapter.compare(password, user.password);
        if (!isPasswordValid) {
            return { ok: false, error: { code: Status.BAD_REQUEST, message: "Invalid password" } }
        }

        //? Devolver el usuario y el token
        //? Tengo que colocar el password con _ debido a que arriba en el loginUserDto ya existe un password
        //? El _ es un placeholder para el password
        const { password: _, ...userEntity } = UserEntity.fromObject(user);

        const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });

        if (!token) {
            return { ok: false, error: { code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" } }
        }

        return { ok: true, value: { user: userEntity, token }};
    }

    private async sendEmailValidationLink(email: string): Promise<Result<void, ServiceError>> {
        //Generar un token
        const token = await JwtAdapter.generateToken({ email });
        if (!token) return { ok: false, error: { code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" } }

        const link = `${envs.WEB_SERVICE_URL}/auth/validate-email/${token}`

        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Verifica tu dirección de correo electrónico</h2>
                <p>Gracias por registrarte. Por favor haz clic en el siguiente botón para verificar tu dirección de correo electrónico:</p>
                <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Verificar correo</a>
                <p>O copia y pega el siguiente enlace en tu navegador:</p>
                <p><a href="${link}">${link}</a></p>
                <hr>
                <p style="font-size: 0.9em; color: #666;">Si no creaste una cuenta, puedes ignorar este correo.</p>
            </div>
        `;

        const options = {
            to: email,
            subject: "Verificación de correo",
            htmlBody: html,
        }

        const isSent = await this.emailService.sendEmail(options);
        if (!isSent) return { ok: false, error: { code: Status.SERVICE_UNAVAILABLE, message: "Mail service unavailable" } }

        return { ok: true };
    }

    public async validateEmail(token: string): Promise<Result<void, ServiceError>> {

        //?Primero verificamos el token que nos envian por la url
        const payload = await JwtAdapter.verifyToken(token);
        if (!payload) return { ok: false, error: { code: Status.UNAUTHORIZED, message: "Invalid token" } };


        //? Despues verificamos que el email este en el payload del JWT
        const { email } = payload as { email: string };
        if (!email) return { ok: false, error: { code: Status.BAD_REQUEST, message: "Email not in token" } };

        //? Despues tenemos que verificar que el usuario existe en BD
        const user = await UserModel.findOne({ email });

        // Returning a specific message for a non-existent user could lead to enumeration attacks, leaving it at status 500
        if (!user) return { ok: false, error: { code: Status.INTERNAL_SERVER_ERROR, message: "Internal Server Error" } };

        //? Por ultimo modificamos el estado del email verificado
        user.emailValidated = true;
        await user.save();

        return { ok: true };
    }
}