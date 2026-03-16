// ──────────────────────────────────────────────────────────────────────────────
// ALGORITMO: LIGA (Round-Robin — Método del Círculo)
//
// Genera todos los enfrentamientos para un torneo todos-contra-todos.
// Con legs=1: cada par juega una vez.
// Con legs=2: ida y vuelta (home/away invertidos en la segunda rueda).
// Si N (equipos) es impar, se agrega un "bye" ficticio.
// ──────────────────────────────────────────────────────────────────────────────

export interface LeagueConfig {
  legs: number;           // 1 = una vuelta, 2 = ida y vuelta
  tiebreakOrder?: string;
  advanceCount?: number;
}

export interface MatchInput {
  id: number;
  groupTeamId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  status: string;
  round: number;
  matchday: number;
  scheduledDate: Date;
  scheduledTime: string;
  venue?: string;
  city?: string;
}

export function generateLeagueFixture(
  teamIds: number[],
  groupTeamId: number,
  config: LeagueConfig,
  startMatchId: number,
  startDate: Date,
  matchIntervalMs: number,
  times: string[],
  venue?: string,
  city?: string,
): MatchInput[] {
  if (teamIds.length < 2) return [];

  // Si N es impar, agregar bye (-1) para que quede par
  const arr: (number | null)[] = teamIds.length % 2 === 0
    ? [...teamIds]
    : [...teamIds, null];

  const n = arr.length;
  const totalRounds = n - 1;
  const matches: MatchInput[] = [];
  let matchId = startMatchId;

  for (let r = 0; r < totalRounds; r++) {
    const roundDate = new Date(startDate.getTime() + r * matchIntervalMs);
    let slotInRound = 0;

    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];

      if (home === null || away === null) continue; // bye

      // Alternar local/visitante por jornada para equidad
      const [h, a] = r % 2 === 0 ? [home, away] : [away, home];

      matches.push({
        id: matchId++,
        groupTeamId,
        homeTeamId: h,
        awayTeamId: a,
        homeScore: 0,
        awayScore: 0,
        status: "pending",
        round: r + 1,
        matchday: r + 1,
        scheduledDate: roundDate,
        scheduledTime: times[slotInRound % times.length],
        venue,
        city,
      });
      slotInRound++;
    }

    // Rotar: fijar arr[0], rotar el resto en sentido horario
    const last = arr.pop()!;
    arr.splice(1, 0, last);
  }

  // Segunda vuelta: invertir local/visitante
  if (config.legs === 2) {
    const firstLeg = [...matches];
    for (const m of firstLeg) {
      const roundDate = new Date(
        startDate.getTime() + (totalRounds + m.round - 1) * matchIntervalMs,
      );
      matches.push({
        id: matchId++,
        groupTeamId,
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        homeScore: 0,
        awayScore: 0,
        status: "pending",
        round: totalRounds + m.round,
        matchday: totalRounds + m.round,
        scheduledDate: roundDate,
        scheduledTime: m.scheduledTime,
        venue,
        city,
      });
    }
  }

  return matches;
}
