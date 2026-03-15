import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";
import { Status } from "../../config/status";

export class AuthMiddleware{
    static async validateJWT(req: Request, res: Response, next: NextFunction){
        const authorization = req.header('Authorization');
        if(!authorization) return res.status(Status.UNAUTHORIZED).json({message: "No token provided"});
        if(!authorization.startsWith("Bearer ")) return res.status(Status.UNAUTHORIZED).json({error: "Invalid Bearer token"})

        const token = authorization.split(" ").at(1) || "";

        try {

            const payload = await JwtAdapter.verifyToken<{ id: string, email: string }>(token);
            if(!payload) return res.status(Status.UNAUTHORIZED).json({error: "Invalid token"});

            const user = await UserModel.findById(payload.id);
            //? También podemos ver si el usuario esta activo user.isActive
            if (!user) return res.status(Status.UNAUTHORIZED).json({error: "Invalid token - user"});


            //TODO: Validate if user is active
            

            const entityResult = UserEntity.fromObject(user);
            
            if (!entityResult.ok) {
                // Shouldn't happen
                console.error(entityResult.error);
                return res.status(Status.INTERNAL_SERVER_ERROR).json({error: "Internal Server Error"});
            }

            //? Se puede poner en cualquier parte de la petición, en el body es fácil de acceder
            req.body.user = entityResult.value;

            /*
                TODO: Remove req.body.user
                We shouldn't be hijacking the request body for passing info; plus, this could result on GET requests
                with a body, which is an anti-pattern. Per the Express docs, `res.locals` is a non-persisted object 
                that can be used to pass data between middleware without causing side effects, scoped to a single 
                request; thus, conceptually the correct place to put the user info. 

                Leaving both in for now to not break the app.
            */
            res.locals.user = entityResult.value;

            next();

        }catch (error){
            console.error(error);
            //? We should to use Winsgton o something like that, to get info in our logs about the error
            res.status(Status.INTERNAL_SERVER_ERROR).json({error: "Internal Server Error"});
        }
    }
}