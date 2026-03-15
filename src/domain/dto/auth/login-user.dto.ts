import { z } from "zod";

import { Result, ok, fail } from "../../../config/result";

export class LoginUserDto {
    static readonly schema = z.object({
        email: z.email("Invalid email"),
        password: z.string("Password is required").min(8, "Password must be at least 8 characters"),
    });

    private constructor(
        public readonly email: string,
        public readonly password: string
    ) { }

    static create(payload: any): Result<LoginUserDto> {
        const { email, password } = payload ?? {};

        const parseResult = this.schema.safeParse({ email, password });

        if (!parseResult.success) return fail(parseResult.error.message);

        return ok(new LoginUserDto(email, password));
    }
}
