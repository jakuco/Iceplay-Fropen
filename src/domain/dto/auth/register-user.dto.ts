export class RegisterUserDto {
  private constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(payload: any): [string?, RegisterUserDto?] {
    const { name, email, password } = payload ?? {};

    if (!name || typeof name !== 'string') return ['name is required'];
    if (!email || typeof email !== 'string') return ['email is required'];
    if (!password || typeof password !== 'string') return ['password is required'];
    if (password.length < 6) return ['password must be at least 6 characters'];

    return [undefined, new RegisterUserDto(name.trim(), email.trim().toLowerCase(), password)];
  }
}
