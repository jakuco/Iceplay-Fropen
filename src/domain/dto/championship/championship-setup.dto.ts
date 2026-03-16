import { z } from "zod";

const PhaseSetupSchema = z.object({
  name: z.string().min(1),
  phaseType: z.enum(["league", "knockout", "groups", "swiss"] as const),
  phaseOrder: z.number().int().min(1),
  config: z.record(z.string(), z.any()).optional().default({}),
});

const ChampionshipSetupSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with dashes"),
  season: z.string().min(1),
  organizationId: z.number().int().min(1),
  sportId: z.number().int().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  maxTeams: z.number().int().min(2).optional(),
  maxPlayersPerTeam: z.number().int().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  registrationStartDate: z.coerce.date().optional(),
  registrationEndDate: z.coerce.date().optional(),
  phases: z.array(PhaseSetupSchema).min(1, "At least one phase is required"),
});

const EnrollTeamSchema = z.object({
  name: z.string().min(1),
  shortname: z.string().min(1).max(10),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().optional(),
  location: z.string().optional(),
  coachName: z.string().optional(),
  coachPhone: z.string().optional(),
  phaseId: z.number().int().optional(),
  groupTeamId: z.number().int().optional(),
});

const EnrollTeamsSchema = z.object({
  teams: z.array(EnrollTeamSchema).min(1),
});

export class ChampionshipSetupDTO {
  static validate(body: unknown) {
    const result = ChampionshipSetupSchema.safeParse(body);
    if (!result.success) {
      return { error: result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; "), data: null };
    }
    return { error: null, data: result.data };
  }
}

export class EnrollTeamsDTO {
  static validate(body: unknown) {
    const result = EnrollTeamsSchema.safeParse(body);
    if (!result.success) {
      return { error: result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; "), data: null };
    }
    return { error: null, data: result.data };
  }
}
