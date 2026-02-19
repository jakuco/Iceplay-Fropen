export class LoginUserDto {
  private constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(payload: any): [string?, LoginUserDto?] {
    const { email, password } = payload ?? {};

    if (!email || typeof email !== 'string') return ['email is required'];
    if (!password || typeof password !== 'string') return ['password is required'];

    return [undefined, new LoginUserDto(email.trim().toLowerCase(), password)];
  }
}
