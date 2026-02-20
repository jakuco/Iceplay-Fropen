import { Request, Response } from "express";
import { CustomError, LoginUserDto, RegisterUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";


export class AuthController {

    //DI
    constructor(
        public readonly authService: AuthService,
    ){

    }

    private handleError = (error: unknown, res: Response) => {
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({message: error.message});
        }
        console.log(`${error}`);
        return res.status(500).json({message: 'Internal Server Error'});
    }
    

    userRegister = async (req: Request, res:Response) => {
        const [error, registerUserDto] = RegisterUserDto.create(req.body);
        if(error) { return res.status(400).json({message: error});}
        
        try {
            const user = await this.authService.registerUser(registerUserDto!);
            res.json(user);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    loginUser = async (req: Request, res:Response) => {
        const [error, loginUserDto] = LoginUserDto.create(req.body);
      if(error) { return res.status(400).json({message: error});}
        try {
            const user = await this.authService.loginUser(loginUserDto!);
            res.json(user);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    validateEmail = async (req: Request, res:Response) => {
        const { token } = req.params

        try {
            await this.authService.validateEmail(token);
            //? Se envia una pagina para notificar al usuario de que su correo se verifico
            res.setHeader('Content-Type', 'text/html');
            return res.send(`
                <html>
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <title>Email Verificado</title>
                    <style>
                      body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        background: #f3f4f6;
                        color: #222;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                      }
                      .container {
                        background: #fff;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.07);
                        padding: 3em 2em;
                        border-radius: 10px;
                        text-align: center;
                        max-width: 380px;
                      }
                      .check {
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #e0e7ff;
                        border-radius: 50%;
                      }
                      .check svg {
                        stroke: #4f46e5;
                        stroke-width: 3;
                        width: 50px;
                        height: 50px;
                      }
                      h2 {
                        margin-top: 0;
                        color: #4f46e5;
                        letter-spacing: 1px;
                      }
                      p {
                        color: #555;
                        margin-bottom: 0;
                        font-size: 1.07em;
                      }
                      .button {
                        display: inline-block;
                        margin-top: 25px;
                        background: #4f46e5;
                        color: #fff;
                        padding: 12px 28px;
                        border-radius: 7px;
                        text-decoration: none;
                        font-weight: 600;
                        transition: background 0.2s;
                      }
                      .button:hover {
                        background: #3730a3;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="check">
                        <svg fill="none" viewBox="0 0 50 50">
                          <circle cx="25" cy="25" r="24" fill="#e0e7ff" />
                          <path d="M14 27l7 7 15-15" stroke="#4f46e5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <h2>¡Email verificado!</h2>
                      <p>Tu dirección de correo electrónico ha sido validada exitosamente.<br>
                      Ahora puedes continuar usando todos los servicios.</p>
                    </div>
                  </body>
                </html>
            `);
            // res.json({ message: "Email validated successfully" });
        } catch (error) {
            this.handleError(error, res);
        }
    }
 
}