// src/domain/dto/coach/update-coach.dto.ts
export class UpdateCoachDto {
  private constructor(
    public readonly name?: string,
    public readonly phone?: string,
    public readonly email?: string,
  ) {}

  static create(payload: any): [string?, UpdateCoachDto?] {
    const { name, phone, email } = payload ?? {};

    let nameValue: string | undefined;
    if (name !== undefined) {
      if (typeof name !== 'string') return ['name must be a string'];
      const v = name.trim();
      if (v.length === 0) return ['name cannot be empty'];
      if (v.length > 20) return ['name must be at most 20 characters'];
      nameValue = v;
    }

    let phoneValue: string | undefined;
    if (phone !== undefined) {
      if (typeof phone !== 'string') return ['phone must be a string'];
      const v = phone.trim();
      if (v.length === 0) return ['phone cannot be empty'];
      if (v.length > 12) return ['phone must be at most 12 characters'];
      phoneValue = v;
    }

    let emailValue: string | undefined;
    if (email !== undefined) {
      if (typeof email !== 'string') return ['email must be a string'];
      const v = email.trim().toLowerCase();
      if (v.length === 0) return ['email cannot be empty'];
      if (v.length > 40) return ['email must be at most 40 characters'];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v)) return ['email must be a valid email'];
      emailValue = v;
    }

    // si mandan {} vacío, igual devolvemos dto válido (solo no cambia nada)
    return [undefined, new UpdateCoachDto(nameValue, phoneValue, emailValue)];
  }
}