import { Request, Response } from "express";
import path from "path";
import { LoginUserDto, RegisterUserDto } from "$domain";
import { ServiceError } from "$domain/errors";
import { AuthService } from "$presentation/services/auth.service";
import { Status } from "$config/status";


export class AuthController {

    //DI
    constructor(
        public readonly authService: AuthService,
    ) { }

    private handleError = (error: ServiceError, res: Response) => {
        if (error.code >= 500) {
            // In case a server error isn't handled at the boundary, at least we'll know that something went wrong.
            // We won't know where, though.
            console.error(error.message);
        }

        return res.status(error.code).json({ message: error.message });
    }

    userRegister = async (req: Request, res: Response) => {
        const result = RegisterUserDto.create(req.body);

        if (!result.ok) { return res.status(Status.BAD_REQUEST).json({ message: result.error }); }

        const serviceResult = await this.authService.registerUser(result.value);

        if (!serviceResult.ok) {
            return this.handleError(serviceResult.error, res);
        }
        
        res.json(serviceResult.value);
    }

    loginUser = async (req: Request, res: Response) => {
        const result = LoginUserDto.create(req.body);
        
        if (!result.ok) { return res.status(400).json({ message: result.error }); }

        const serviceResult = await this.authService.loginUser(result.value);

        if (!serviceResult.ok) {
            return this.handleError(serviceResult.error, res);
        }

        res.json(serviceResult.value);
    }

    validateEmail = async (req: Request, res: Response) => {
        const { token } = req.params

        const serviceResult = await this.authService.validateEmail(token);

        if (!serviceResult.ok) {
            return this.handleError(serviceResult.error, res);
        }

        //? Se envía una pagina para notificar al usuario de que su correo se verifico
        return res.sendFile(path.join(__dirname, 'public', 'email-validated.html')/*, { headers: { 'Content-Type': 'text/html' } }*/);
    }

    renewToken = async (_: Request, res: Response) => {
        const serviceResult = await this.authService.renewToken(res.locals.user);

        if (!serviceResult.ok) {
            return this.handleError(serviceResult.error, res);
        }

        res.json({ token: serviceResult.value });
    }
}