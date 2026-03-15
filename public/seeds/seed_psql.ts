import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../../src/data/drizzle/modelos/schema";
import * as fs from "fs";
import * as path from "path";
import {envs} from "../../src/config/envs";

// ─── Tipos del JSON ────────────────────────────────────────────────────────────

interface JsonMatchEvent {
  typeMatchEventId: number;
  playerId: number | null;
  teamId: number | null;
  time: number;
}

interface JsonMatchPlayer {
  playerId: number;
}

interface JsonMatch {
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  round: number;
  matchday: number;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  venue: string;
  city: string;
  matchEvents?: JsonMatchEvent[];
  matchPlayers?: JsonMatchPlayer[];
}

interface JsonGroupTeam {
  id: number;
  name: string;
  type: string;
  order: number;
  teams: { teamId: number }[];
  matches: JsonMatch[];
}

interface JsonPhaseSwiss {
  num_rounds: number;
  pairing_system: string;
  first_round: string;
  allow_rematch: boolean;
  tiebreak_order: string;
  direct_advance_count: number;
  playoff_count: number;
}

interface JsonPhaseKnockout {
  legs: number;
  fixture_mode: string;
  seeding: string;
  bye_strategy: string;
  tie_break: string;
  away_goals_rule: boolean;
  third_place_match: boolean;
}

interface JsonPhaseLeague {
  legs: number;
  tiebreak_order: string;
  advance_count: number;
}

interface JsonPhaseGroups {
  num_groups: number;
  teams_per_group: number;
  assignment: string;
  legs: number;
  advance_per_group: number;
  advance_best_thirds: number;
  tiebreak_order: string;
}

interface JsonPhase {
  id: number;
  phase_type: "swiss" | "knockout" | "league" | "groups";
  phase_order: number;
  name: string;
  status: string;
  phase_suizo?: JsonPhaseSwiss;
  phase_knockout?: JsonPhaseKnockout;
  phase_league?: JsonPhaseLeague;
  phase_groups?: JsonPhaseGroups;
  groupTeam: JsonGroupTeam[];
}

interface JsonPosition {
  code: string;
  label: string;
  abbreviation: string;
}

interface JsonTypeMatchEvent {
  id: number;
  label: string;
  icon: string;
  color: string;
  matchPoint: number;
  category: string;
  standingPoints: number;
}

interface JsonMatchRule {
  name: string;
  value: number;
}

interface JsonSport {
  icon: string;
  periods: number;
  match_type_singular: string;
  match_type_plural: string;
  periodDuration: number;
  periodLabel: string;
  periodLabelPlural: string;
  positions: JsonPosition[];
  typeMatchEvents: JsonTypeMatchEvent[];
  matchRules: JsonMatchRule[];
}

interface JsonSocialLink {
  link: string;
  socialNetwork: {
    name: string;
    icon: string;
  };
}

interface JsonPlayer {
  id: number;
  firstName: string;
  lastName: string;
  nickName: string;
  number: number;
  position: string;
  birthDate: string | null;
  height: number;
  weight: number;
  status: string;
  suspensionEndDate: string | null;
  suspensionReason: string | null;
}

interface JsonTeam {
  id: number;
  name: string;
  shortname: string;
  slug: string;
  logoUrl: string;
  documentURL: string;
  primaryColor: string;
  secondaryColor: string;
  foundedYear: number;
  homeVenue: number;
  location: string;
  isActive: boolean;
  hasActiveMatches: boolean;
  coachName: string;
  coachPhone: string;
  players: JsonPlayer[];
}

interface JsonChampionship {
  name: string;
  slug: string;
  description: string;
  season: string;
  logo: string;
  status: number;
  registrationStartDate: string;
  registrationEndDate: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  sport: JsonSport;
  socialLinks: JsonSocialLink[];
  teams: JsonTeam[];
  phases: JsonPhase[];
}

interface JsonOrganization {
  name: string;
  slug: string;
  description: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  championships: JsonChampionship[];
}

interface SeedData {
  organization: JsonOrganization;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte "DD/MM/YYYY" a "YYYY-MM-DD" */
function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  // Si ya está en formato ISO, devolverlo directo
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10);
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// ─── Seed principal ────────────────────────────────────────────────────────────

async function seed() {
  const pool = new Pool({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD,
    database: envs.DB_NAME,
  });


  const db = drizzle(pool, { schema });

  const rawData = fs.readFileSync(
    path.join(__dirname, "ejemploV2.json"),
    "utf-8"
  );
  const data: SeedData = JSON.parse(rawData);
  const { organization } = data;

  console.log("🌱 Iniciando seed...\n");

  // ── 0. Limpiar tablas en orden inverso a las FK ──────────────────────────────
console.log("🧹 Limpiando tablas...");
await db.execute(sql`TRUNCATE TABLE
  match_players,
  match_events,
  matches,
  team_group_teams,
  group_teams,
  phase_swiss,
  phase_league,
  phase_knockout,
  phase_groups,
  phases,
  players,
  teams,
  match_rules_championship_sports,
  social_links,
  social_networks,
  championships,
  sport_type_match_events,
  sport_match_rules,
  sport_positions,
  type_match_events,
  match_rules,
  positions,
  sports,
  role_permissions,
  user_roles,
  users,
  organizations
  RESTART IDENTITY CASCADE
`);
console.log("   ✅ Tablas limpiadas\n");

  // ── 1. Organization ──────────────────────────────────────────────────────────
  console.log("📦 Insertando organización...");
  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logo: organization.logo,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      city: organization.city,
      country: organization.country,
      primaryColor: organization.primaryColor,
      secondaryColor: organization.secondaryColor,
    })
    .returning();

  console.log(`   ✅ Organización: "${org.name}" (id: ${org.id})\n`);

  for (const championship of organization.championships) {
    const { sport } = championship;

    // ── 2. Sport ───────────────────────────────────────────────────────────────
    console.log("⚽ Insertando deporte...");
    const [sportRow] = await db
      .insert(schema.sports)
      .values({
        icon: sport.icon,
        periods: String(sport.periods),
        matchTypeSingular: sport.match_type_singular,
        matchTypePlural: sport.match_type_plural,
        periodDuration: String(sport.periodDuration),
        periodLabel: sport.periodLabel,
        periodLabelPlural: sport.periodLabelPlural,
      })
      .returning();

    console.log(`   ✅ Deporte insertado (id: ${sportRow.id})\n`);

    // ── 3. Positions ───────────────────────────────────────────────────────────
    console.log("🎽 Insertando posiciones...");
    // Map: code -> positionId (para asignar a jugadores después)
    const positionCodeToId = new Map<string, number>();

    for (const pos of sport.positions) {
      const [posRow] = await db
        .insert(schema.positions)
        .values({
          code: pos.code,
          label: pos.label,
          abbreviation: pos.abbreviation,
        })
        .returning();

      positionCodeToId.set(pos.code, posRow.id);

      await db.insert(schema.sportPositions).values({
        sportId: sportRow.id,
        positionsId: posRow.id,
      });
    }

    console.log(`   ✅ ${sport.positions.length} posiciones insertadas\n`);

    // ── 4. TypeMatchEvents ─────────────────────────────────────────────────────
    console.log("🎯 Insertando tipos de evento de partido...");
    // Map: jsonId -> real DB id
    const typeEventJsonIdToDbId = new Map<number, number>();

    for (const tme of sport.typeMatchEvents) {
      // Forzamos el ID del JSON con OVERRIDING SYSTEM VALUE
      await db.execute(sql`
        INSERT INTO type_match_events (id, label, icon, color, match_point, category, standing_points)
        OVERRIDING SYSTEM VALUE
        VALUES (
          ${tme.id}, ${tme.label}, ${tme.icon}, ${tme.color},
          ${tme.matchPoint}, ${tme.category}, ${tme.standingPoints}
        )
      `);

      // El ID de la DB ES el mismo que el del JSON
      typeEventJsonIdToDbId.set(tme.id, tme.id);

      await db.insert(schema.sportTypeMatchEvents).values({
        sportId: sportRow.id,
        typeMatchEventId: tme.id,
      });
    }

    // Resetear secuencia para que futuros inserts no colisionen
    await db.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('type_match_events', 'id'),
        (SELECT MAX(id) FROM type_match_events)
      )
    `);

    console.log(
      `   ✅ ${sport.typeMatchEvents.length} tipos de evento insertados\n`
    );

    // ── 5. MatchRules ──────────────────────────────────────────────────────────
    console.log("📋 Insertando reglas de partido...");
    const matchRuleIds: number[] = [];

    for (const rule of sport.matchRules) {
      const [ruleRow] = await db
        .insert(schema.matchRules)
        .values({
          name: rule.name,
          value: rule.value,
        })
        .returning();

      matchRuleIds.push(ruleRow.id);

      await db.insert(schema.sportMatchRules).values({
        sportId: sportRow.id,
        matchRulesId: ruleRow.id,
      });
    }

    console.log(`   ✅ ${sport.matchRules.length} reglas insertadas\n`);

    // ── 6. Championship ────────────────────────────────────────────────────────
    console.log("🏆 Insertando campeonato...");
    const [champRow] = await db
      .insert(schema.championships)
      .values({
        organizationId: org.id,
        sportId: sportRow.id,
        name: championship.name,
        slug: championship.slug,
        description: championship.description,
        season: championship.season,
        logo: championship.logo,
        status: Number(championship.status),
        registrationStartDate: parseDate(championship.registrationStartDate),
        registrationEndDate: parseDate(championship.registrationEndDate),
        startDate: parseDate(championship.startDate),
        endDate: parseDate(championship.endDate),
        maxTeams: championship.maxTeams,
      })
      .returning();

    console.log(`   ✅ Campeonato: "${champRow.name}" (id: ${champRow.id})\n`);

    // ── 7. MatchRules_Championship_Sport ──────────────────────────────────────
    console.log("🔗 Vinculando reglas al campeonato...");
    for (const ruleId of matchRuleIds) {
      await db.insert(schema.matchRulesChampionshipSports).values({
        matchRulesId: ruleId,
        championshipId: champRow.id,
        sportId: sportRow.id,
      });
    }
    console.log(`   ✅ ${matchRuleIds.length} reglas vinculadas\n`);

    // ── 8. SocialLinks + SocialNetworks ────────────────────────────────────────
    console.log("🔗 Insertando redes sociales...");
    for (const sl of championship.socialLinks) {
      const [snRow] = await db
        .insert(schema.socialNetworks)
        .values({
          name: sl.socialNetwork.name,
          icon: sl.socialNetwork.icon,
        })
        .returning();

      await db.insert(schema.socialLinks).values({
        championshipId: champRow.id,
        socialNetworkId: snRow.id,
        link: sl.link,
      });
    }
    console.log(
      `   ✅ ${championship.socialLinks.length} redes sociales insertadas\n`
    );
// ── Mapeo nombre descriptivo → código de posición ──────────────────────────
const positionLabelToCode: Record<string, string> = {
  "Goalkeeper":           "GK",
  "Center Back":          "CB",
  "Defender":             "LB",
  "Right Back":           "RB",
  "Defensive Midfielder": "CDM",
  "Midfielder":           "CM",
  "Winger":               "LW",
  "Forward":              "ST",
};

    // ── 9. Teams + Players ────────────────────────────────────────────────────
    console.log("👥 Insertando equipos y jugadores...");

    // Map: jsonId -> real DB id (para referencias en partidos y eventos)
    const teamJsonIdToDbId = new Map<number, number>();
    const playerJsonIdToDbId = new Map<number, number>();

    for (const team of championship.teams) {
      await db.execute(sql`
        INSERT INTO teams (
          id, championship_id, name, shortname, slug, logo_url, document_url,
          primary_color, secondary_color, founded_year, home_venue, location,
          is_active, has_active_matches, coach_name, coach_phone
        )
        OVERRIDING SYSTEM VALUE
        VALUES (
          ${team.id}, ${champRow.id}, ${team.name}, ${team.shortname}, ${team.slug},
          ${team.logoUrl}, ${team.documentURL}, ${team.primaryColor}, ${team.secondaryColor},
          ${team.foundedYear}, ${team.homeVenue}, ${team.location},
          ${team.isActive}, ${team.hasActiveMatches}, ${team.coachName}, ${team.coachPhone}
        )
      `);

      // El ID de la DB ES el mismo que el del JSON
      teamJsonIdToDbId.set(team.id, team.id);

      // Players
      for (const player of team.players) {
        const positionCode = positionLabelToCode[player.position] ?? player.position;
        const positionId = positionCodeToId.get(positionCode) ?? null;
        await db.execute(sql`
          INSERT INTO players (
            id, team_id, position_id, first_name, last_name, nick_name,
            number, birth_date, height, weight, status,
            suspension_end_date, suspension_reason
          )
          OVERRIDING SYSTEM VALUE
          VALUES (
            ${player.id}, ${team.id}, ${positionId},
            ${player.firstName}, ${player.lastName}, ${player.nickName},
            ${player.number}, ${parseDate(player.birthDate)},
            ${player.height != null ? String(player.height) : null},
            ${player.weight != null ? String(player.weight) : null},
            ${player.status}, ${parseDate(player.suspensionEndDate)},
            ${player.suspensionReason}
          )
        `);

        playerJsonIdToDbId.set(player.id, player.id);
      }
    }

    // Resetear secuencias
    await db.execute(sql`
      SELECT setval(pg_get_serial_sequence('teams', 'id'),   (SELECT MAX(id) FROM teams));
    `);
    await db.execute(sql`
      SELECT setval(pg_get_serial_sequence('players', 'id'), (SELECT MAX(id) FROM players));
    `);

    console.log(
      `   ✅ ${championship.teams.length} equipos insertados con sus jugadores\n`
    );

    // ── 10. Phases + SubPhases + GroupTeams + Matches ─────────────────────────
    console.log("📅 Insertando fases, grupos y partidos...");

    for (const phase of championship.phases) {
      // Phase — usar ID del JSON
      await db.execute(sql`
        INSERT INTO phases (id, championship_id, name, phase_type, phase_order, status)
        OVERRIDING SYSTEM VALUE
        VALUES (
          ${phase.id}, ${champRow.id}, ${phase.name},
          ${phase.phase_type}, ${phase.phase_order}, ${phase.status}
        )
      `);

      // Sub-fase según tipo
      if (phase.phase_type === "swiss" && phase.phase_suizo) {
        await db.insert(schema.phaseSwiss).values({
          phaseId: phase.id,
          numRounds: phase.phase_suizo.num_rounds,
          pairingSystem: phase.phase_suizo.pairing_system,
          firstRound: phase.phase_suizo.first_round,
          allowRematch: phase.phase_suizo.allow_rematch,
          tiebreakOrder: phase.phase_suizo.tiebreak_order,
          directAdvancedCount: phase.phase_suizo.direct_advance_count,
          playoffCount: phase.phase_suizo.playoff_count,
        });
      }

      if (phase.phase_type === "knockout" && phase.phase_knockout) {
        await db.insert(schema.phaseKnockout).values({
          phaseId: phase.id,
          legs: phase.phase_knockout.legs,
          fixtureMode: phase.phase_knockout.fixture_mode,
          seeding: phase.phase_knockout.seeding,
          byeStrategy: phase.phase_knockout.bye_strategy,
          tieBreak: phase.phase_knockout.tie_break,
          awayGoalsRule: phase.phase_knockout.away_goals_rule,
          thirdPlaceMatch: phase.phase_knockout.third_place_match,
        });
      }

      if (phase.phase_type === "league" && phase.phase_league) {
        await db.insert(schema.phaseLeague).values({
          phaseId: phase.id,
          legs: phase.phase_league.legs,
          tiebreakOrder: phase.phase_league.tiebreak_order,
          advanceCount: phase.phase_league.advance_count,
        });
      }

      if (phase.phase_type === "groups" && phase.phase_groups) {
        await db.insert(schema.phaseGroups).values({
          phaseId: phase.id,
          numGroups: phase.phase_groups.num_groups,
          teamsPerGroup: phase.phase_groups.teams_per_group,
          assignment: phase.phase_groups.assignment,
          legs: phase.phase_groups.legs,
          advancePerGroup: phase.phase_groups.advance_per_group,
          advanceBestThirds: phase.phase_groups.advance_best_thirds,
          tiebreakOrder: phase.phase_groups.tiebreak_order,
        });
      }

      // GroupTeams — usar ID del JSON
      for (const group of phase.groupTeam) {
        await db.execute(sql`
          INSERT INTO group_teams (id, phase_id, name, type, "order")
          OVERRIDING SYSTEM VALUE
          VALUES (${group.id}, ${phase.id}, ${group.name}, ${group.type}, ${group.order})
        `);

        // Team_groupTeam (relación equipos ↔ grupo)
        for (const gt of group.teams) {
          const realTeamId = teamJsonIdToDbId.get(gt.teamId);
          if (!realTeamId) {
            console.warn(
              `   ⚠️  teamId ${gt.teamId} no encontrado en el mapa, saltando...`
            );
            continue;
          }
          await db.insert(schema.teamGroupTeams).values({
            teamId: realTeamId,
            groupTeamId: group.id,
          });
        }

        // Matches
        for (const match of group.matches) {
          const homeTeamDbId = teamJsonIdToDbId.get(match.homeTeamId);
          const awayTeamDbId = teamJsonIdToDbId.get(match.awayTeamId);

          if (!homeTeamDbId || !awayTeamDbId) {
            console.warn(
              `   ⚠️  Partido con equipos no encontrados (home: ${match.homeTeamId}, away: ${match.awayTeamId}), saltando...`
            );
            continue;
          }

          const [matchRow] = await db
            .insert(schema.matches)
            .values({
              groupTeamId: group.id,
              homeTeamId: homeTeamDbId,
              awayTeamId: awayTeamDbId,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              status: match.status,
              round: String(match.round),
              matchday: match.matchday,
              scheduledDate: parseDate(match.scheduledDate),
              scheduledTime: match.scheduledTime,
              venue: match.venue,
              city: match.city,
            })
            .returning();

          // MatchEvents
          if (match.matchEvents && match.matchEvents.length > 0) {
            for (const event of match.matchEvents) {
              const realTypeEventId = typeEventJsonIdToDbId.get(
                event.typeMatchEventId
              );
              if (!realTypeEventId) {
                console.warn(
                  `   ⚠️  typeMatchEventId ${event.typeMatchEventId} no encontrado, saltando evento...`
                );
                continue;
              }

              const realPlayerId =
                event.playerId != null
                  ? playerJsonIdToDbId.get(event.playerId) ?? null
                  : null;

              const realTeamId =
                event.teamId != null
                  ? teamJsonIdToDbId.get(event.teamId) ?? null
                  : null;

              await db.insert(schema.matchEvents).values({
                matchId: matchRow.id,
                typeMatchEventId: realTypeEventId,
                playerId: realPlayerId,
                teamId: realTeamId,
                time: event.time,
              });
            }
          }

          // MatchPlayers
          if (match.matchPlayers && match.matchPlayers.length > 0) {
            for (const mp of match.matchPlayers) {
              const realPlayerId = playerJsonIdToDbId.get(mp.playerId);
              if (!realPlayerId) {
                console.warn(
                  `   ⚠️  playerId ${mp.playerId} no encontrado en el mapa, saltando...`
                );
                continue;
              }
              await db.insert(schema.matchPlayers).values({
                matchId: matchRow.id,
                playerId: realPlayerId,
              });
            }
          }
        }
      }

      // Resetear secuencias de phases y group_teams
      await db.execute(sql`
        SELECT setval(pg_get_serial_sequence('phases', 'id'),      (SELECT MAX(id) FROM phases));
      `);
      await db.execute(sql`
        SELECT setval(pg_get_serial_sequence('group_teams', 'id'), (SELECT MAX(id) FROM group_teams));
      `);

      console.log(
        `   ✅ Fase "${phase.name}" (${phase.phase_type}) insertada con ${phase.groupTeam.length} grupos`
      );
    }

    console.log();
  }

  console.log("✅ Seed completado exitosamente!\n");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Error durante el seed:", err);
  process.exit(1);
});