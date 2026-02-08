import { regularExps } from "../../../config";

export class RegisterUserDto {
    private constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly password: string,
    ) { }

    // return type is a discriminated tuple: either [errorMessage, undefined] or [undefined, RegisterUserDto]
    static create(obj: { [key: string]: any }): [string?, RegisterUserDto?] {

        const { name, email, password } = obj;

        if (!name) {
            return ['Name is required', undefined];
        }
        if (!email) {
            return ['Email is required', undefined];
        }
        if(regularExps.email.test(email) === false){
            return ['Email format is invalid', undefined];
        }
        if (!password) {
            return ['Password is required', undefined];
        }
        if (password.length < 6) {
            return ['Password too short, min 6 characters', undefined];
        }

        return [undefined, new RegisterUserDto(name, email, password)];
    }

}

