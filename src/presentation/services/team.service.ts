import { eq, count, asc, and } from "drizzle-orm";
import { getDb } from "../../data/drizzle/db";
import { teams } from "../../data/drizzle/models/schema";
import { CustomError, PaginationDTO } from "../../domain";

export class TeamService {
  constructor() {}

  async getTeams(paginationDTO: PaginationDTO, filters: { organizationId?: number; championshipId?: number } = {}) {
    const db = getDb();
    const { page, limit } = paginationDTO;

    const conditions = [];
    if (filters.championshipId) conditions.push(eq(teams.championshipId, filters.championshipId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    try {
      const [{ total }] = await db.select({ total: count() }).from(teams).where(where);

      const rows = await db
        .select()
        .from(teams)
        .where(where)
        .orderBy(asc(teams.id))
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        page,
        limit,
        total,
        next: page * limit < total ? `/api/teams?page=${page + 1}&limit=${limit}` : null,
        prev: page - 1 > 0 ? `/api/teams?page=${page - 1}&limit=${limit}` : null,
        teams: rows,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllTeams(filters: { organizationId?: number; championshipId?: number } = {}) {
    const db = getDb();

    const conditions = [];
    if (filters.championshipId) conditions.push(eq(teams.championshipId, filters.championshipId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    try {
      return await db.select().from(teams).where(where).orderBy(asc(teams.id));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getTeamById(id: number) {
    const db = getDb();

    const team = await db.query.teams.findFirst({ where: eq(teams.id, id) });
    if (!team) throw CustomError.notfound("Team not found");

    return team;
  }

  async updateTeam(id: number, data: any) {
    const db = getDb();

    const existing = await db.query.teams.findFirst({ where: eq(teams.id, id) });
    if (!existing) throw CustomError.notfound("Team not found");

    try {
      const [updated] = await db
        .update(teams)
        .set({
          name:            data.name            ?? existing.name,
          shortname:       data.shortname       ?? existing.shortname,
          primaryColor:    data.primaryColor    ?? existing.primaryColor,
          secondaryColor:  data.secondaryColor  ?? existing.secondaryColor,
          logoUrl:         data.logoUrl         ?? existing.logoUrl,
          location:        data.location        ?? existing.location,
          coachName:       data.coachName       ?? existing.coachName,
          coachPhone:      data.coachPhone      ?? existing.coachPhone,
          isActive:        data.isActive        ?? existing.isActive,
        })
        .where(eq(teams.id, id))
        .returning();

      return updated;
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteTeam(id: number) {
    const db = getDb();

    const existing = await db.query.teams.findFirst({ where: eq(teams.id, id) });
    if (!existing) throw CustomError.notfound("Team not found");

    await db.delete(teams).where(eq(teams.id, id));

    return { message: "Team deleted successfully", id };
  }
}
