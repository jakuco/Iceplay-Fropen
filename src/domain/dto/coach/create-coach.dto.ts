export class CreateCoachDto {
  private constructor(
    public readonly coach_id: number,
    public readonly name: string,
    public readonly phone: string,
    public readonly email: string,
  ) {}

  static create(payload: any): [string?, CreateCoachDto?] {
    const { coach_id, name, phone, email } = payload ?? {};

    if (coach_id === undefined || Number.isNaN(Number(coach_id))) {
      return ['coach_id must be a number'];
    }

    if (!name || typeof name !== 'string') {
      return ['name is required'];
    }

    if (!phone || typeof phone !== 'string') {
      return ['phone is required'];
    }

    if (!email || typeof email !== 'string') {
      return ['email is required'];
    }

    const nameTrim = name.trim();
    if (nameTrim.length === 0) return ['name is required'];
    if (nameTrim.length > 20) return ['name must be at most 20 characters'];

    const phoneTrim = phone.trim();
    if (phoneTrim.length === 0) return ['phone is required'];
    if (phoneTrim.length > 12) return ['phone must be at most 12 characters'];

    const emailTrim = email.trim().toLowerCase();
    if (emailTrim.length === 0) return ['email is required'];
    if (emailTrim.length > 40) return ['email must be at most 40 characters'];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) return ['email must be a valid email'];

    return [
      undefined,
      new CreateCoachDto(
        Number(coach_id),
        nameTrim,
        phoneTrim,
        emailTrim,
      ),
    ];
  }
}