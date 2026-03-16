import { z } from "zod";

const GenerateFixtureSchema = z.object({
  phaseId: z.number().int().min(1),
  startDate: z.coerce.date(),
  matchIntervalDays: z.number().int().min(1).default(7),
  matchTimes: z.array(z.string()).min(1).default(["00:00", "24:00"]),
  venue: z.string().optional(),
  city: z.string().optional(),
});

export class GenerateFixtureDTO {
  static validate(body: unknown) {
    const result = GenerateFixtureSchema.safeParse(body);
    if (!result.success) {
      return { error: result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; "), data: null };
    }
    return { error: null, data: result.data };
  }
}
