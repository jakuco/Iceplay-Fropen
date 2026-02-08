export class LoginUserDto {

    private constructor(
        public readonly email: string,
        public readonly password: string,
    ) { }

    static create(obj: { [key: string]: any }): [string?, LoginUserDto?] {
        const { email, password } = obj;
        if (!email) {
            return ['Email is required', undefined];
        }
        if (!password) {
            return ['Password is required', undefined];
        }
        return [undefined, new LoginUserDto(email, password)];
    }

}