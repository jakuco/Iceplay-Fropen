// ──────────────────────────────────────────────────────────────────────────────
// ALGORITMO: SISTEMA SUIZO (Monrad)
//
// Ronda 1: emparejamiento aleatorio (o por seed).
// Ronda N: agrupar por puntos → emparejar adyacentes evitando rematches.
// Nadie se elimina. Al final se clasifica por puntos + Buchholz.
// ──────────────────────────────────────────────────────────────────────────────

import { MatchInput } from "./league.algorithm";

export interface SwissConfig {
  numRounds: number;
  pairingSystem?: string;  // "monrad" | "dutch"
  firstRound?: string;     // "random" | "seeded"
  allowRematch?: boolean;
}

export interface SwissStanding {
  teamId: number;
  points: number;
  buchholz: number;       // suma de puntos de rivales
  opponents: number[];    // ids de rivales ya enfrentados
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ronda 1: emparejamiento aleatorio o por seed */
export function generateSwissRound1(
  teamIds: number[],
  groupTeamId: number,
  config: SwissConfig,
  startMatchId: number,
  startDate: Date,
  times: string[],
  venue?: string,
  city?: string,
): MatchInput[] {
  const ordered = config.firstRound === "seeded"
    ? [...teamIds]
    : shuffle(teamIds);

  const matches: MatchInput[] = [];
  let matchId = startMatchId;

  for (let i = 0; i + 1 < ordered.length; i += 2) {
    matches.push({
      id: matchId++,
      groupTeamId,
      homeTeamId: ordered[i],
      awayTeamId: ordered[i + 1],
      homeScore: 0,
      awayScore: 0,
      status: "pending",
      round: 1,
      matchday: 1,
      scheduledDate: startDate,
      scheduledTime: times[matches.length % times.length],
      venue,
      city,
    });
  }
  // Si N es impar, el último queda con bye (sin partido esta ronda)

  return matches;
}

/**
 * Ronda N (N > 1): emparejamiento Monrad.
 * Ordena por puntos DESC, empareja adyacentes evitando rematches.
 */
export function generateSwissRoundN(
  standings: SwissStanding[],
  round: number,
  groupTeamId: number,
  config: SwissConfig,
  startMatchId: number,
  startDate: Date,
  times: string[],
  venue?: string,
  city?: string,
): MatchInput[] {
  // Ordenar: puntos DESC, luego buchholz DESC
  const sorted = [...standings].sort((a, b) =>
    b.points !== a.points ? b.points - a.points : b.buchholz - a.buchholz,
  );

  const paired = new Set<number>();
  const matches: MatchInput[] = [];
  let matchId = startMatchId;

  for (let i = 0; i < sorted.length; i++) {
    const home = sorted[i];
    if (paired.has(home.teamId)) continue;

    // Buscar el próximo rival no emparejado y sin rematch
    for (let j = i + 1; j < sorted.length; j++) {
      const away = sorted[j];
      if (paired.has(away.teamId)) continue;
      if (!config.allowRematch && home.opponents.includes(away.teamId)) continue;

      matches.push({
        id: matchId++,
        groupTeamId,
        homeTeamId: home.teamId,
        awayTeamId: away.teamId,
        homeScore: 0,
        awayScore: 0,
        status: "pending",
        round,
        matchday: round,
        scheduledDate: startDate,
        scheduledTime: times[matches.length % times.length],
        venue,
        city,
      });

      paired.add(home.teamId);
      paired.add(away.teamId);
      break;
    }
    // Si no encontró rival, el equipo recibe bye esta ronda
  }

  return matches;
}
