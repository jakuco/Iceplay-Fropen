import { eq, count, asc } from "drizzle-orm";
import { getDb } from "../../data/drizzle/db";
import { championships } from "../../data/drizzle/models/schema";
import { CustomError, PaginationDTO } from "../../domain";

type CreateChampionshipDTO = any;

export class ChampionshipService {
  constructor() {}

  async createChampionship(dto: CreateChampionshipDTO) {
    const db = getDb();

    const existing = await db.query.championships.findFirst({
      where: eq(championships.slug, dto.slug),
    });
    if (existing) throw CustomError.badRequest("Championship already exists");

    try {
      const [championship] = await db
        .insert(championships)
        .values({
          name: dto.name,
          slug: dto.slug,
          season: dto.season,
          organizationId: dto.organizationId,
          sportId: dto.sportId,
          description: dto.description,
          logo: dto.logo,
          status: dto.status ?? 0,
          maxTeams: dto.maxTeams,
          maxPlayersPerTeam: dto.maxPlayersPerTeam,
          startDate: dto.startDate,
          endDate: dto.endDate,
          registrationStartDate: dto.registrationStartDate,
          registrationEndDate: dto.registrationEndDate,
        })
        .returning();

      return {
        id: championship.id,
        name: championship.name,
        status: championship.status,
        season: championship.season,
      };
    } catch (err) {
      throw CustomError.internalServer(`${err}`);
    }
  }

  async getChampionships(paginationDTO: PaginationDTO, organizationId?: number) {
    const db = getDb();
    const { page, limit } = paginationDTO;
    const where = organizationId ? eq(championships.organizationId, organizationId) : undefined;

    try {
      const [{ total }] = await db
        .select({ total: count() })
        .from(championships)
        .where(where);

      const rows = await db
        .select()
        .from(championships)
        .where(where)
        .orderBy(asc(championships.id))
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        page,
        limit,
        total,
        next:
          page * limit < total
            ? `/api/championships?page=${page + 1}&limit=${limit}`
            : null,
        prev:
          page - 1 > 0
            ? `/api/championships?page=${page - 1}&limit=${limit}`
            : null,
        championships: rows,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getAllChampionships() {
    const db = getDb();
    try {
      return await db.select().from(championships).orderBy(asc(championships.id));
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async getChampionshipById(id: number) {
    const db = getDb();

    const championship = await db.query.championships.findFirst({
      where: eq(championships.id, id),
    });
    if (!championship) throw CustomError.badRequest("Championship not found");

    return {
      id: championship.id,
      name: championship.name,
      status: championship.status,
      season: championship.season,
    };
  }

  async updateChampionship(id: number, data: any) {
    const db = getDb();

    const existing = await db.query.championships.findFirst({
      where: eq(championships.id, id),
    });
    if (!existing) throw CustomError.badRequest("Championship not found");

    try {
      const [updated] = await db
        .update(championships)
        .set({
          name: data.name ?? existing.name,
          slug: data.slug ?? existing.slug,
          season: data.season ?? existing.season,
          description: data.description ?? existing.description,
          logo: data.logo ?? existing.logo,
          status: data.status ?? existing.status,
          maxTeams: data.maxTeams ?? existing.maxTeams,
          maxPlayersPerTeam: data.maxPlayersPerTeam ?? existing.maxPlayersPerTeam,
          startDate: data.startDate ?? existing.startDate,
          endDate: data.endDate ?? existing.endDate,
          registrationStartDate: data.registrationStartDate ?? existing.registrationStartDate,
          registrationEndDate: data.registrationEndDate ?? existing.registrationEndDate,
          updatedAt: new Date(),
        })
        .where(eq(championships.id, id))
        .returning();

      return {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        season: updated.season,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  async deleteChampionship(id: number) {
    const db = getDb();

    const existing = await db.query.championships.findFirst({
      where: eq(championships.id, id),
    });
    if (!existing) throw CustomError.badRequest("Championship not found");

    await db.delete(championships).where(eq(championships.id, id));

    return { message: "Championship deleted successfully", id };
  }
}
