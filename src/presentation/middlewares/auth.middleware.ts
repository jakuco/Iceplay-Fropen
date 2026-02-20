import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { UserEntity } from "../../domain";

export class AuthMiddleware{
    static async validateJWT(req: Request, res: Response, next: NextFunction){
        const authorization = req.header('Authorization');
        if(!authorization) return res.status(401).json({message: "No token provided"});
        if(!authorization.startsWith("Bearer ")) return res.status(401).json({error: "Invalid Bearer token"})

        const token = authorization.split(" ").at(1) || "";

        try{

            const payload = await JwtAdapter.verifyToken<{ id: string, email: string }>(token);
            if(!payload) return res.status(401).json({error: "Invalid token"});

            const user = await UserModel.findById(payload.id);
            //? tambien podemos ver si el usuario esta activo user.isActive
            if (!user) return res.status(401).json({error: "Invalid token - user"});


            //TODO: Validate if user is active

            //? Se puede poner en cualquier parte de la peticion, en el body es facil de acceder
            req.body.user = UserEntity.fromObject(user);

            next();

        }catch (error){
            console.log(error);
            //? We should to use Winsgton o something like that, to get info in our logs about the error
            res.status(500).json({error: "Internal Server Error"});
        }
    }
}