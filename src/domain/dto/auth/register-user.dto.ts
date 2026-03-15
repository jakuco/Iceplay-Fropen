import { z } from "zod";
import { Result, ok, fail } from "$config/result";

export class RegisterUserDto {
    static readonly schema = z.object({
        name: z.string("Name is required").min(3, "Name too short"),
        email: z.email("Invalid email"),
        password: z.string("Password is required").min(8, "Password must be at least 8 characters"),
    });

    private constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly password: string
    ) { }

    static create(payload: any): Result<RegisterUserDto> {
        const parseResult = this.schema.safeParse(payload);

        if (!parseResult.success) return fail(parseResult.error.message);

        const { name, email, password } = parseResult.data;

        return ok(new RegisterUserDto(name, email, password));
    }
}
