import { z } from "zod";
import { Result, ok, fail } from "../../config/result";

export class UserEntity {
    static readonly schema = z.object({
        id: z.number({ message: "Missing id" }),
        organizationId: z.number({ message: "Missing organizationId" }).nullable().optional(),
        name: z.string({ message: "Missing name" }),
        email: z.string({ message: "Missing email" }).email("Invalid email"),
        emailValidated: z.boolean(),
        password: z.string({ message: "Missing password" }),
        role: z.number({ message: "Missing role" }).nullable().optional(), // FK directa a roles.id
        img: z.string().nullable().optional(),
    });

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly email: string,
        public readonly emailValidated: boolean,
        public readonly password: string,
        public readonly organizationId?: number | null,
        public readonly role?: number | null,
        public readonly img?: string | null,
    ) {}

    static fromObject(obj: { [key: string]: any }): Result<UserEntity> {
        const parseResult = this.schema.safeParse(obj);

        if (!parseResult.success) {
            return fail(parseResult.error.message);
        }

        const { id, name, email, emailValidated, password, organizationId, role, img } =
            parseResult.data;

        return ok(
            new UserEntity(
                id,
                name,
                email,
                emailValidated,
                password,
                organizationId,
                role,
                img,
            ),
        );
    }
}