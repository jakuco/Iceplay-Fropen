import { z } from "zod";
import { Result, ok, fail } from "$config/result";

export class UserEntity {
    static readonly schema = z.object({
        id: z.string("Missing id"),
        name: z.string("Missing name"),
        email: z.email("Invalid email"),
        emailValidated: z.string("Missing emailValidated"),
        password: z.string("Missing password"),
        role: z.array(z.string(), "Missing roles"),
        img: z.string().optional(),
    });

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly emailValidated: string,
        public readonly password: string,
        public readonly role: string[],
        public readonly img?: string,
    ) { }

    static fromObject(obj: { [key: string]: any }): Result<UserEntity> {
        if (obj.id === undefined) {
            obj.id = obj._id;
        }

        const parseResult = this.schema.safeParse(obj);
        
        if (!parseResult.success) {
            return fail(parseResult.error.message);
        }

        const { id, name, email, emailValidated, password, role, img } = parseResult.data;

        return ok(new UserEntity(
            id,
            name,
            email,
            emailValidated,
            password,
            role,
            img,
        ));
    }

}