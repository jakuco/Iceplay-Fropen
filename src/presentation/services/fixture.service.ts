import { eq, inArray, asc } from "drizzle-orm";
import { getDb } from "../../data/drizzle/db";
import {
  championships,
  phases,
  phaseLeague,
  phaseKnockout,
  phaseGroups,
  phaseSwiss,
  groupTeams,
  teams,
  teamGroupTeams,
  matches,
} from "../../data/drizzle/modelos/schema";
import { CustomError } from "../../domain";

import { generateLeagueFixture, LeagueConfig, MatchInput } from "./fixture/algorithms/league.algorithm";
import { generateKnockoutFixture, KnockoutConfig } from "./fixture/algorithms/knockout.algorithm";
import { generateSwissRound1 } from "./fixture/algorithms/swiss.algorithm";

export interface GenerateFixtureParams {
  phaseId: number;
  startDate: Date;
  matchIntervalDays: number;
  matchTimes: string[];
  venue?: string;
  city?: string;
}

const DAY_MS = 86_400_000;


function stripId({ id: _id, ...rest }: MatchInput) {
  return rest;
}


export class FixtureService {
  constructor() {}

  async generateFixture(championshipId: number, params: GenerateFixtureParams) {
    const db = getDb();
    const { phaseId, startDate, matchIntervalDays, matchTimes, venue, city } = params;
    const intervalMs = matchIntervalDays * DAY_MS;
    const times = matchTimes.length ? matchTimes : ["16:00", "19:00"];

    const championship = await db.query.championships.findFirst({
      where: eq(championships.id, championshipId),
    });
    if (!championship) throw CustomError.notfound("Championship not found");

    const phase = await db.query.phases.findFirst({
      where: eq(phases.id, phaseId),
    });
    if (!phase || phase.championshipId !== championshipId)
      throw CustomError.notfound("Phase not found in this championship");

    const groups = await db.select().from(groupTeams).where(eq(groupTeams.phaseId, phaseId));
    const groupIds = groups.map((g) => g.id);

    if (groupIds.length > 0) {
      const existing = await db
        .select()
        .from(matches)
        .where(inArray(matches.groupTeamId, groupIds));

      if (existing.length > 0)
        throw CustomError.badRequest(
          `Fixture already generated for phase ${phaseId} (${existing.length} matches found). Delete them first.`
        );
    }

    let allMatches: Omit<MatchInput, "id">[] = [];

    if (phase.phaseType === "league") {
      allMatches = await this.generateLeague(phase, groups, intervalMs, startDate, times, venue, city);
    } else if (phase.phaseType === "knockout") {
      allMatches = await this.generateKnockout(phase, groups, intervalMs, startDate, times, venue, city);
    } else if (phase.phaseType === "groups") {
      allMatches = await this.generateGroups(phase, groups, intervalMs, startDate, times, venue, city);
    } else if (phase.phaseType === "swiss") {
      allMatches = await this.generateSwiss(phase, groups, startDate, times, venue, city);
    } else {
      throw CustomError.badRequest(`Unknown phaseType: ${phase.phaseType}`);
    }

    if (!allMatches.length)
      throw CustomError.badRequest("No matches could be generated. Check that teams are enrolled.");

    const inserted = await db.insert(matches).values(
      allMatches.map((m) => ({
        groupTeamId: m.groupTeamId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: m.status,
        round: m.round !== null && m.round !== undefined ? String(m.round) : null,
        matchday: m.matchday,
        scheduledDate: m.scheduledDate ? m.scheduledDate.toISOString().split("T")[0] : null,
        scheduledTime: m.scheduledTime ?? null,
        venue: m.venue ?? null,
        city: m.city ?? null,
      }))
    ).returning();

    await db.update(phases).set({ status: "active" }).where(eq(phases.id, phaseId));

    return {
      phaseId,
      phaseType: phase.phaseType,
      totalMatches: inserted.length,
      rounds: [...new Set(allMatches.map((m) => m.round))].length,
      matches: inserted,
    };
  }

  async getFixture(championshipId: number, filters: { phaseId?: number; round?: number }) {
    const db = getDb();

    const championship = await db.query.championships.findFirst({
      where: eq(championships.id, championshipId),
    });
    if (!championship) throw CustomError.notfound("Championship not found");

    const phaseRows = filters.phaseId
      ? await db.select().from(phases).where(eq(phases.id, filters.phaseId))
      : await db.select().from(phases).where(eq(phases.championshipId, championshipId)).orderBy(asc(phases.phaseOrder));

    const phaseIds = phaseRows.map((p) => p.id);
    if (phaseIds.length === 0) return {};

    const groupRows = await db.select().from(groupTeams).where(inArray(groupTeams.phaseId, phaseIds));
    const groupIds = groupRows.map((g) => g.id);
    if (groupIds.length === 0) return {};

    const matchRows = groupIds.length > 0
      ? await db.select().from(matches).where(inArray(matches.groupTeamId, groupIds)).orderBy(asc(matches.round), asc(matches.scheduledDate))
      : [];

    const filteredMatches = filters.round
      ? matchRows.filter((m) => Number(m.round) === filters.round)
      : matchRows;

    const teamIds = [
      ...new Set(filteredMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]).filter((id): id is number => id > 0)),
    ];
    const teamRows = teamIds.length > 0 ? await db.select().from(teams).where(inArray(teams.id, teamIds)) : [];
    const teamMap = Object.fromEntries(teamRows.map((t) => [t.id, t]));

    const enriched = filteredMatches.map((m) => ({
      ...m,
      homeTeam: teamMap[m.homeTeamId] ?? null,
      awayTeam: teamMap[m.awayTeamId] ?? null,
    }));

    const result: any = {};
    for (const phase of phaseRows) {
      const phaseGroupIds = groupRows.filter((g) => g.phaseId === phase.id).map((g) => g.id);
      const phaseMatches = enriched.filter((m) => phaseGroupIds.includes(m.groupTeamId));

      const byRound: Record<number, any[]> = {};
      for (const m of phaseMatches) {
        const r = Number(m.round) || 1;
        if (!byRound[r]) byRound[r] = [];
        byRound[r].push(m);
      }

      result[phase.name] = {
        phaseId: phase.id,
        phaseType: phase.phaseType,
        status: phase.status,
        totalMatches: phaseMatches.length,
        rounds: byRound,
      };
    }

    return result;
  }

  private async generateLeague(
    phase: any,
    groups: any[],
    intervalMs: number,
    startDate: Date,
    times: string[],
    venue?: string,
    city?: string
  ): Promise<Omit<MatchInput, "id">[]> {
    const db = getDb();
    const config = await db.query.phaseLeague.findFirst({ where: eq(phaseLeague.phaseId, phase.id) });
    if (!config) throw CustomError.notfound(`PhaseLeague config not found for phase ${phase.id}`);

    const leagueConfig: LeagueConfig = {
      legs: config.legs ?? 1,
      tiebreakOrder: config.tiebreakOrder ?? undefined,
      advanceCount: config.advanceCount ?? 0,
    };

    const all: Omit<MatchInput, "id">[] = [];
    for (const group of groups) {
      const assignments = await db.select().from(teamGroupTeams).where(eq(teamGroupTeams.groupTeamId, group.id));
      const teamIds = assignments.map((a) => a.teamId);
      if (teamIds.length < 2) continue;

      const generated = generateLeagueFixture(teamIds, group.id, leagueConfig, 0, startDate, intervalMs, times, venue, city);
      all.push(...generated.map(stripId));
    }
    return all;
  }

  private async generateKnockout(
    phase: any,
    groups: any[],
    intervalMs: number,
    startDate: Date,
    times: string[],
    venue?: string,
    city?: string
  ): Promise<Omit<MatchInput, "id">[]> {
    const db = getDb();
    const config = await db.query.phaseKnockout.findFirst({ where: eq(phaseKnockout.phaseId, phase.id) });
    if (!config) throw CustomError.notfound(`PhaseKnockout config not found for phase ${phase.id}`);

    const koConfig: KnockoutConfig = {
      legs: config.legs ?? 1,
      thirdPlaceMatch: config.thirdPlaceMatch ?? false,
      seeding: config.seeding ?? undefined,
      byeStrategy: config.byeStrategy ?? undefined,
    };

    const all: Omit<MatchInput, "id">[] = [];
    for (const group of groups) {
      const assignments = await db.select().from(teamGroupTeams).where(eq(teamGroupTeams.groupTeamId, group.id));
      const teamIds = assignments.map((a) => a.teamId);
      if (teamIds.length < 2) continue;

      const generated = generateKnockoutFixture(teamIds, group.id, koConfig, 0, startDate, intervalMs, times, venue, city);
      all.push(...generated.map(stripId));
    }
    return all;
  }

  private async generateGroups(
    phase: any,
    groups: any[],
    intervalMs: number,
    startDate: Date,
    times: string[],
    venue?: string,
    city?: string
  ): Promise<Omit<MatchInput, "id">[]> {
    const db = getDb();
    const config = await db.query.phaseGroups.findFirst({ where: eq(phaseGroups.phaseId, phase.id) });
    if (!config) throw CustomError.notfound(`PhaseGroups config not found for phase ${phase.id}`);

    const leagueConfig: LeagueConfig = { legs: config.legs ?? 1 };

    const all: Omit<MatchInput, "id">[] = [];
    for (const group of groups) {
      const assignments = await db.select().from(teamGroupTeams).where(eq(teamGroupTeams.groupTeamId, group.id));
      const teamIds = assignments.map((a) => a.teamId);
      if (teamIds.length < 2) continue;

      const generated = generateLeagueFixture(teamIds, group.id, leagueConfig, 0, startDate, intervalMs, times, venue, city);
      all.push(...generated.map(stripId));
    }
    return all;
  }

  private async generateSwiss(
    phase: any,
    groups: any[],
    startDate: Date,
    times: string[],
    venue?: string,
    city?: string
  ): Promise<Omit<MatchInput, "id">[]> {
    const db = getDb();
    const config = await db.query.phaseSwiss.findFirst({ where: eq(phaseSwiss.phaseId, phase.id) });
    if (!config) throw CustomError.notfound(`PhaseSwiss config not found for phase ${phase.id}`);

    const swissConfig = {
      numRounds: config.numRounds ?? 5,
      pairingSystem: config.pairingSystem ?? "monrad",
      firstRound: config.firstRound ?? "random",
      allowRematch: config.allowRematch ?? false,
    };

    const all: Omit<MatchInput, "id">[] = [];
    for (const group of groups) {
      const assignments = await db.select().from(teamGroupTeams).where(eq(teamGroupTeams.groupTeamId, group.id));
      const teamIds = assignments.map((a) => a.teamId);
      if (teamIds.length < 2) continue;

      const generated = generateSwissRound1(teamIds, group.id, swissConfig, 0, startDate, times, venue, city);
      all.push(...generated.map(stripId));
    }
    return all;
  }
}
