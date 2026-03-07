import { UserModel } from "$data/mongo/models/user.model";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "$domain";
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

    public async registerUser(registerUserDto: RegisterUserDto): Promise<Result<AuthResponse, { msg: string, code: number }>> {
        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) {
            return { ok: false, error: { msg: "Email already in use", code: Status.BAD_REQUEST } }
        }

        try {
            const user = new UserModel(registerUserDto);

            //TODO: Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();

            //TODO: JWT para mantener la autenticación del usuario
            const token = JwtAdapter.generateToken({ id: user._id.toString() });

            if (token === null) {
                return { ok: false, error: { msg: "Error while creating JWT", code: Status.INTERNAL_SERVER_ERROR } }
            }

            //TODO: Enviar correo de verificacion de JWT
            this.sendEmailValidationLink(user.email)

            //? Devolver el usuario sin la contraseña
            const { password, ...userEntity } = UserEntity.fromObject(user);
            return { ok: true, value: { user: userEntity, token }};

        } catch (err) {
            console.error(err);
            return { ok: false, error: { msg: "Internal Server Error", code: Status.INTERNAL_SERVER_ERROR } }
        }
    }

    public async loginUser(loginUserDto: LoginUserDto): Promise<Result<AuthResponse>> {
        const { email, password } = loginUserDto;

        //? Buscar el usuario por email
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw CustomError.badRequest('User not found');
        }

        //? Comparar la contraseña
        const isPasswordValid = bcryptAdapter.compare(password, user.password);
        if (!isPasswordValid) {
            throw CustomError.badRequest('Invalid password');
        }

        //? Devolver el usuario y el token
        //? Tengo que colocar el password con _ debido a que arriba en el loginUserDto ya existe un password
        //? El _ es un placeholder para el password
        const { password: _, ...userEntity } = UserEntity.fromObject(user);

        const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
        if (!token) {
            throw CustomError.internalServer('Error while creating JWT')
        }
        return { user: userEntity, token };
    }

    private async sendEmailValidationLink(email: string) {
        //Generar un token
        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer("Error getting token")

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
            subject: " Validate your email",
            htmlBody: html,
        }

        const isSent = await this.emailService.sendEmail(options);
        if (!isSent) throw CustomError.internalServer("Error sending verification email")

        return true;
    }

    public async validateEmail(token: string) {

        //?Primero verificamos el token que nos envian por la url
        const payload = await JwtAdapter.verifyToken(token);
        if (!payload) throw CustomError.unathorized('Invalid token');


        //? Despues verificamos que el email este en el payload del JWT
        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServer("Email not in token");

        //? Despues tenemos que verificar que el usuario existe en BD
        const user = await UserModel.findOne({ email });
        if (!user) throw CustomError.internalServer("Email not exist");

        //? Por ultimo modificamos el estado del email verificado
        user.emailValidated = true;
        await user.save();

        return true;
    }
}