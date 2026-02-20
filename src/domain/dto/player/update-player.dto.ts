export class UpdatePlayerDto {
  private constructor(
    public readonly number?: number,
    public readonly name?: string,
    public readonly lastname?: string,
    public readonly weight?: number,
    public readonly height?: number,
    public readonly primary_position?: number,
    public readonly secondary_position?: number,
    public readonly home_country?: string,
    public readonly state_id?: number,
    public readonly type?: number,
    public readonly team_id?: number,
    public readonly player_statics?: any
  ) {}

  static create(payload: any): [string?, UpdatePlayerDto?] {
    const {
      number,
      name,
      lastname,
      weight,
      height,
      primary_position,
      secondary_position,
      home_country,
      state_id,
      type,
      team_id,
      player_statics,
    } = payload ?? {};

    // Validaciones suaves: solo valida si viene el campo
    if (number !== undefined && Number.isNaN(Number(number))) return ["number must be a number"];
    if (weight !== undefined && Number.isNaN(Number(weight))) return ["weight must be a number"];
    if (height !== undefined && Number.isNaN(Number(height))) return ["height must be a number"];
    if (primary_position !== undefined && Number.isNaN(Number(primary_position))) return ["primary_position must be a number"];
    if (secondary_position !== undefined && Number.isNaN(Number(secondary_position))) return ["secondary_position must be a number"];
    if (state_id !== undefined && Number.isNaN(Number(state_id))) return ["state_id must be a number"];
    if (type !== undefined && Number.isNaN(Number(type))) return ["type must be a number"];
    if (team_id !== undefined && Number.isNaN(Number(team_id))) return ["team_id must be a number"];

    if (name !== undefined && typeof name !== "string") return ["name must be a string"];
    if (lastname !== undefined && typeof lastname !== "string") return ["lastname must be a string"];
    if (home_country !== undefined && typeof home_country !== "string") return ["home_country must be a string"];

    const cleanName = name !== undefined ? name.trim() : undefined;
    const cleanLastname = lastname !== undefined ? lastname.trim() : undefined;
    const cleanCountry = home_country !== undefined ? home_country.trim() : undefined;

    if (cleanName !== undefined && cleanName.length === 0) return ["name cannot be empty"];
    if (cleanLastname !== undefined && cleanLastname.length === 0) return ["lastname cannot be empty"];

    return [
      undefined,
      new UpdatePlayerDto(
        number !== undefined ? Number(number) : undefined,
        cleanName,
        cleanLastname,
        weight !== undefined ? Number(weight) : undefined,
        height !== undefined ? Number(height) : undefined,
        primary_position !== undefined ? Number(primary_position) : undefined,
        secondary_position !== undefined ? Number(secondary_position) : undefined,
        cleanCountry,
        state_id !== undefined ? Number(state_id) : undefined,
        type !== undefined ? Number(type) : undefined,
        team_id !== undefined ? Number(team_id) : undefined,
        player_statics
      ),
    ];
  }
}