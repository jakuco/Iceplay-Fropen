// ──────────────────────────────────────────────────────────────────────────────
// ALGORITMO: ELIMINACIÓN DIRECTA (Bracket)
//
// Genera el bracket de eliminación directa a partir de equipos seeded.
// - Si N no es potencia de 2, los mejores seeds reciben "bye" en ronda 1.
// - Con legs=2 se genera partido de ida y vuelta por cruce.
// - Los cruces de rondas futuras se crean con homeTeamId=0/awayTeamId=0 (TBD).
// - Opcionalmente genera partido por 3er y 4to puesto.
// ──────────────────────────────────────────────────────────────────────────────

import { MatchInput } from "./league.algorithm";

export interface KnockoutConfig {
  legs: number;            // 1 = partido único, 2 = ida y vuelta
  thirdPlaceMatch: boolean;
  seeding?: string;        // "ranked" | "random" | "group_position"
  byeStrategy?: string;    // "top_seed" | "bottom_seed"
}

const DAY_MS = 86400_000;
const WEEK_MS = 7 * DAY_MS;

/** Próxima potencia de 2 ≥ n */
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

export function generateKnockoutFixture(
  teamIds: number[],
  groupTeamId: number,
  config: KnockoutConfig,
  startMatchId: number,
  startDate: Date,
  matchIntervalMs: number,
  times: string[],
  venue?: string,
  city?: string,
): MatchInput[] {
  const n = teamIds.length;
  if (n < 2) return [];

  const bracket = nextPow2(n);
  // Rellenar con -1 (bye) hasta potencia de 2; los byes van al final (top seeds libran)
  const seeded: (number | -1)[] = [...teamIds];
  while (seeded.length < bracket) seeded.push(-1);

  const matches: MatchInput[] = [];
  let matchId = startMatchId;
  let roundTeams: (number | -1)[] = [...seeded];
  let round = 1;

  while (roundTeams.length > 1) {
    const nextRound: (number | -1)[] = [];
    const roundDate = new Date(startDate.getTime() + (round - 1) * matchIntervalMs);

    for (let i = 0; i < roundTeams.length; i += 2) {
      const home = roundTeams[i];
      const away = roundTeams[i + 1];

      // Bye automático
      if (away === -1) { nextRound.push(home); continue; }
      if (home === -1) { nextRound.push(away); continue; }

      // Partido de ida
      matches.push({
        id: matchId++,
        groupTeamId,
        homeTeamId: home,
        awayTeamId: away,
        homeScore: 0,
        awayScore: 0,
        status: "pending",
        round,
        matchday: round,
        scheduledDate: roundDate,
        scheduledTime: times[matches.length % times.length],
        venue,
        city,
      });

      // Partido de vuelta (si legs=2)
      if (config.legs === 2) {
        const returnDate = new Date(roundDate.getTime() + WEEK_MS);
        matches.push({
          id: matchId++,
          groupTeamId,
          homeTeamId: away,
          awayTeamId: home,
          homeScore: 0,
          awayScore: 0,
          status: "pending",
          round,
          matchday: round,
          scheduledDate: returnDate,
          scheduledTime: times[matches.length % times.length],
          venue,
          city,
        });
      }

      nextRound.push(0 as any); // 0 = ganador TBD
    }

    roundTeams = nextRound;
    round++;
  }

  // Partido por 3er puesto (si aplica y hubo al menos semis)
  if (config.thirdPlaceMatch && bracket >= 4) {
    const finalRound = round - 1;
    const thirdDate = new Date(startDate.getTime() + (finalRound - 1) * matchIntervalMs);
    matches.push({
      id: matchId++,
      groupTeamId,
      homeTeamId: 0 as any, // TBD: perdedor semi 1
      awayTeamId: 0 as any, // TBD: perdedor semi 2
      homeScore: 0,
      awayScore: 0,
      status: "pending",
      round: finalRound,
      matchday: finalRound,
      scheduledDate: thirdDate,
      scheduledTime: times[0],
      venue,
      city,
    });
  }

  return matches;
}
