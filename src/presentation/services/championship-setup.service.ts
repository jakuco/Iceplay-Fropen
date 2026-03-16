import { eq, inArray, asc } from "drizzle-orm";
import { getDb } from "$data/drizzle/db";
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
} from "$data/drizzle/models/schema";
import { CustomError } from "$domain";


export interface PhaseSetupInput {
    name: string;
    phaseType: "league" | "knockout" | "groups" | "swiss";
    phaseOrder: number;
    config: Record<string, any>;
}

export interface ChampionshipSetupInput {
    name: string;
    slug: string;
    season: string;
    organizationId: number;
    sportId: number;
    description?: string;
    logo?: string;
    maxTeams?: number;
    maxPlayersPerTeam?: number;
    startDate?: Date;
    endDate?: Date;
    registrationStartDate?: Date;
    registrationEndDate?: Date;
    phases: PhaseSetupInput[];
}

export interface TeamEnrollInput {
    name: string;
    shortname: string;
    slug: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    location?: string;
    coachName?: string;
    coachPhone?: string;
    phaseId?: number;
    groupTeamId?: number;
}


export class ChampionshipSetupService {
    constructor() { }


    async setupChampionship(input: ChampionshipSetupInput) {
        const db = getDb();

        const slugExists = await db.query.championships.findFirst({
            where: eq(championships.slug, input.slug),
        });
        if (slugExists) throw CustomError.badRequest(`Slug "${input.slug}" already in use`);

        if (!input.phases || input.phases.length === 0)
            throw CustomError.badRequest("At least one phase is required");

        const [championship] = await db
            .insert(championships)
            .values({
                organizationId: input.organizationId,
                sportId: input.sportId,
                name: input.name,
                slug: input.slug,
                description: input.description ?? "",
                season: input.season,
                logo: input.logo ?? "",
                status: 1,
                maxTeams: input.maxTeams ?? 16,
                maxPlayersPerTeam: input.maxPlayersPerTeam ?? 25,
                startDate: input.startDate ? input.startDate.toISOString().split("T")[0] : null,
                endDate: input.endDate ? input.endDate.toISOString().split("T")[0] : null,
                registrationStartDate: input.registrationStartDate
                    ? input.registrationStartDate.toISOString().split("T")[0]
                    : null,
                registrationEndDate: input.registrationEndDate
                    ? input.registrationEndDate.toISOString().split("T")[0]
                    : null,
            })
            .returning();

        const createdPhases = [];
        const groupLetters = "ABCDEFGHIJKLMNOP";

        for (const phaseInput of input.phases) {
            const [phase] = await db
                .insert(phases)
                .values({
                    championshipId: championship.id,
                    name: phaseInput.name,
                    phaseType: phaseInput.phaseType,
                    phaseOrder: phaseInput.phaseOrder,
                    status: "pending",
                })
                .returning();

            const cfg = phaseInput.config ?? {};
            const createdGroups: any[] = [];

            if (phaseInput.phaseType === "league") {
                await db.insert(phaseLeague).values({
                    phaseId: phase.id,
                    legs: cfg.legs ?? 1,
                    tiebreakOrder: cfg.tiebreakOrder ?? "goal_difference,goals_for,head_to_head",
                    advanceCount: cfg.advanceCount ?? 0,
                });

                const [grp] = await db
                    .insert(groupTeams)
                    .values({ phaseId: phase.id, name: "Todos", type: "group", order: 1 })
                    .returning();
                createdGroups.push({ id: grp.id, name: "Todos", order: 1 });

            } else if (phaseInput.phaseType === "knockout") {
                await db.insert(phaseKnockout).values({
                    phaseId: phase.id,
                    legs: cfg.legs ?? 1,
                    fixtureMode: cfg.fixtureMode ?? "ranked",
                    seeding: cfg.seeding ?? "ranked",
                    byeStrategy: cfg.byeStrategy ?? "top_seed",
                    tieBreak: cfg.tieBreak ?? "extra_time_penalties",
                    awayGoalsRule: cfg.awayGoalsRule ?? false,
                    thirdPlaceMatch: cfg.thirdPlaceMatch ?? false,
                });

                const [grp] = await db
                    .insert(groupTeams)
                    .values({ phaseId: phase.id, name: "Bracket Principal", type: "direct", order: 1 })
                    .returning();
                createdGroups.push({ id: grp.id, name: "Bracket Principal", order: 1 });

            } else if (phaseInput.phaseType === "groups") {
                const numGroups = cfg.numGroups ?? 2;
                await db.insert(phaseGroups).values({
                    phaseId: phase.id,
                    numGroups,
                    teamsPerGroup: cfg.teamsPerGroup ?? 4,
                    assignment: cfg.assignment ?? "serpentine",
                    legs: cfg.legs ?? 1,
                    advancePerGroup: cfg.advancePerGroup ?? 2,
                    advanceBestThirds: cfg.advanceBestThirds ?? 0,
                    tiebreakOrder: cfg.tiebreakOrder ?? "goal_difference,goals_for,head_to_head",
                });

                for (let g = 0; g < numGroups; g++) {
                    const groupName = `Grupo ${groupLetters[g]}`;
                    const [grp] = await db
                        .insert(groupTeams)
                        .values({ phaseId: phase.id, name: groupName, type: "group", order: g + 1 })
                        .returning();
                    createdGroups.push({ id: grp.id, name: groupName, order: g + 1 });
                }

            } else if (phaseInput.phaseType === "swiss") {
                await db.insert(phaseSwiss).values({
                    phaseId: phase.id,
                    numRounds: cfg.numRounds ?? 5,
                    pairingSystem: cfg.pairingSystem ?? "monrad",
                    firstRound: cfg.firstRound ?? "random",
                    allowRematch: cfg.allowRematch ?? false,
                    tiebreakOrder: cfg.tiebreakOrder ?? "buchholz,buchholz_cut1,goals_for",
                    directAdvancedCount: cfg.directAdvancedCount ?? 0,
                    playoffCount: cfg.playoffCount ?? 0,
                });

                const [grp] = await db
                    .insert(groupTeams)
                    .values({ phaseId: phase.id, name: "Torneo Suizo", type: "group", order: 1 })
                    .returning();
                createdGroups.push({ id: grp.id, name: "Torneo Suizo", order: 1 });
            }

            createdPhases.push({
                id: phase.id,
                name: phase.name,
                phaseType: phase.phaseType,
                phaseOrder: phase.phaseOrder,
                groups: createdGroups,
            });
        }

        return {
            championship: {
                id: championship.id,
                name: championship.name,
                slug: championship.slug,
                season: championship.season,
                status: championship.status,
                maxTeams: championship.maxTeams,
                startDate: championship.startDate,
            },
            phases: createdPhases,
        };
    }


    async enrollTeams(championshipId: number, teamsInput: TeamEnrollInput[]) {
        const db = getDb();

        const championship = await db.query.championships.findFirst({
            where: eq(championships.id, championshipId),
        });
        if (!championship) throw CustomError.notfound("Championship not found");
        if (championship.status !== 1)
            throw CustomError.badRequest(
                `Championship is not in registration status (current: ${championship.status})`
            );

        const currentTeamsCount = await db
            .select({ cnt: eq(teams.championshipId, championshipId) })
            .from(teams)
            .where(eq(teams.championshipId, championshipId));
        const currentCount = currentTeamsCount.length;

        if (championship.maxTeams && currentCount + teamsInput.length > championship.maxTeams)
            throw CustomError.badRequest(
                `Exceeds maxTeams (${championship.maxTeams}). Current: ${currentCount}, trying to add: ${teamsInput.length}`
            );

        const defaultPhase = await db.query.phases.findFirst({
            where: eq(phases.championshipId, championshipId),
            orderBy: asc(phases.phaseOrder),
        });
        if (!defaultPhase) throw CustomError.badRequest("No phases found. Run setup first.");

        const defaultGroup = await db.query.groupTeams.findFirst({
            where: eq(groupTeams.phaseId, defaultPhase.id),
            orderBy: asc(groupTeams.order),
        });
        if (!defaultGroup) throw CustomError.badRequest("No groups found. Something went wrong in setup.");

        const enrolled: any[] = [];

        for (const t of teamsInput) {
            const slugExists = await db.query.teams.findFirst({
                where: eq(teams.slug, t.slug),
            });
            if (slugExists) throw CustomError.badRequest(`Team slug "${t.slug}" already exists`);

            const resolvedGroupId = t.groupTeamId ?? defaultGroup.id;

            const [team] = await db
                .insert(teams)
                .values({
                    championshipId,
                    name: t.name,
                    shortname: t.shortname,
                    slug: t.slug,
                    primaryColor: t.primaryColor ?? "#1e40af",
                    secondaryColor: t.secondaryColor ?? "#ffffff",
                    logoUrl: t.logoUrl ?? "",
                    location: t.location ?? "",
                    isActive: true,
                    hasActiveMatches: false,
                    coachName: t.coachName ?? "",
                    coachPhone: t.coachPhone ?? "",
                })
                .returning();

            await db.insert(teamGroupTeams).values({ teamId: team.id, groupTeamId: resolvedGroupId });

            enrolled.push({
                id: team.id,
                name: team.name,
                shortname: team.shortname,
                groupTeamId: resolvedGroupId,
            });
        }

        return {
            championshipId,
            enrolled: enrolled.length,
            totalTeams: currentCount + enrolled.length,
            maxTeams: championship.maxTeams,
            teams: enrolled,
        };
    }


    async getChampionshipDetail(id: number) {
        const db = getDb();

        const championship = await db.query.championships.findFirst({
            where: eq(championships.id, id),
        });
        if (!championship) throw CustomError.notfound("Championship not found");

        const phaseRows = await db
            .select()
            .from(phases)
            .where(eq(phases.championshipId, id))
            .orderBy(asc(phases.phaseOrder));

        const phaseIds = phaseRows.map((p) => p.id);

        const groupRows =
            phaseIds.length > 0
                ? await db.select().from(groupTeams).where(inArray(groupTeams.phaseId, phaseIds))
                : [];

        const groupIds = groupRows.map((g) => g.id);

        const assignments =
            groupIds.length > 0
                ? await db.select().from(teamGroupTeams).where(inArray(teamGroupTeams.groupTeamId, groupIds))
                : [];

        const teamIds = assignments.map((a) => a.teamId);
        const teamRows =
            teamIds.length > 0
                ? await db.select().from(teams).where(inArray(teams.id, teamIds))
                : [];

        const teamMap = Object.fromEntries(teamRows.map((t) => [t.id, t]));

        const phasesWithGroups = phaseRows.map((p) => ({
            ...p,
            groups: groupRows
                .filter((g) => g.phaseId === p.id)
                .map((g) => ({
                    ...g,
                    teams: assignments
                        .filter((a) => a.groupTeamId === g.id)
                        .map((a) => teamMap[a.teamId])
                        .filter(Boolean),
                })),
        }));

        return {
            ...championship,
            totalTeams: teamIds.length,
            phases: phasesWithGroups,
        };
    }
}
