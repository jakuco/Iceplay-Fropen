import { Request, Response } from "express";
import path from "path";
import { CustomError, LoginUserDto, RegisterUserDto } from "$domain";
import { AuthService } from "$presentation/services/auth.service";
import { Status } from "$config/status";


export class AuthController {

    //DI
    constructor(
        public readonly authService: AuthService,
    ) { }

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.log(`${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }


    userRegister = async (req: Request, res: Response) => {
        const result = RegisterUserDto.create(req.body);

        if (!result.ok) { return res.status(Status.BAD_REQUEST).json({ message: result.error }); }

        const resultService = await this.authService.registerUser(result.value);

        if (!resultService.ok) {
            return res.status(resultService.error.code).json({ message: resultService.error.message });
        }
        
        res.json(resultService.value);
    }

    loginUser = async (req: Request, res: Response) => {
        const result = LoginUserDto.create(req.body);
        
        if (!result.ok) { return res.status(400).json({ message: result.error }); }

        try {
            const user = await this.authService.loginUser(result.value);
            res.json(user);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    validateEmail = async (req: Request, res: Response) => {
        const { token } = req.params

        try {
            await this.authService.validateEmail(token);
            //? Se envía una pagina para notificar al usuario de que su correo se verifico
            return res.sendFile(path.join(__dirname, 'public', 'email-validated.html')/*, { headers: { 'Content-Type': 'text/html' } }*/);
            // res.json({ message: "Email validated successfully" });
        } catch (error) {
            this.handleError(error, res);
        }
    }

}