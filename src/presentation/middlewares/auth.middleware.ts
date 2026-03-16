import { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { JwtAdapter } from "$config";
import { getDb } from "../../data/drizzle/db";
import { users } from "../../data/drizzle/models/schema";
import { UserEntity } from "$domain";
import { Status } from "$config/status";

export class AuthMiddleware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header("Authorization");
    if (!authorization) return res.status(Status.UNAUTHORIZED).json({ message: "No token provided" });
    if (!authorization.startsWith("Bearer ")) return res.status(Status.UNAUTHORIZED).json({ error: "Invalid Bearer token" });

    const token = authorization.split(" ").at(1) || "";

    try {
      const payload = await JwtAdapter.verifyToken<{ id: string; email: string }>(token);
      if (!payload) return res.status(Status.UNAUTHORIZED).json({ error: "Invalid token" });

      const db = getDb();
      const user = await db.query.users.findFirst({ where: eq(users.id, parseInt(payload.id)) });
      if (!user) return res.status(Status.UNAUTHORIZED).json({ error: "Invalid token - user" });

      const entityResult = UserEntity.fromObject({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        emailValidated: user.emailValidated ? "true" : "false",
        password: user.password,
        role: [user.role],
        img: user.img ?? undefined,
      });

      if (!entityResult.ok) {
        console.error(entityResult.error);
        return res.status(Status.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
      }

      req.body.user = entityResult.value;
      res.locals.user = entityResult.value;
      next();
    } catch (error) {
      console.error(error);
      res.status(Status.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
  }
}
