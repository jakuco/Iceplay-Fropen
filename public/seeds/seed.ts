import { envs } from "../../src/config/envs";

const API_URL = envs.API_URL;

// Poblar campeonatos
async function seedChampionships() {
  const championships = [
    { championship_id: 10, name: "Liga Nacional", type_id: 1, format_id: 2, state_id: 1, season_id: 2026 },
    { championship_id: 11, name: "Copa Internacional", type_id: 2, format_id: 1, state_id: 1, season_id: 2026 },
  ];

  for (const champ of championships) {
    const res = await fetch(`${API_URL}/championships`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs.JWT_TOKEN}` },
      body: JSON.stringify(champ),
    });
    console.log("Championship created:", await res.json());
  }
}

// Poblar coaches
async function seedCoaches() {
  const coaches = [
    { coach_id: 101, name: "Fabián Bustos", phone: "0999999999", email: "fbustos@club.com" },
    { coach_id: 102, name: "Miguel Rondelli", phone: "0988888888", email: "mrondelli@club.com" },
    { coach_id: 103, name: "Gabriel Schurrer", phone: "0977777777", email: "gschurrer@club.com" },
    { coach_id: 104, name: "Luis Zubeldia", phone: "0966666666", email: "lzubeldia@club.com" },
    { coach_id: 105, name: "M. Anselmi", phone: "0955555555", email: "manselmi@club.com" },
    { coach_id: 106, name: "Cesar Farias", phone: "0944444444", email: "cfarias@club.com" },
  ];

  for (const coach of coaches) {
    const res = await fetch(`${API_URL}/coaches`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs.JWT_TOKEN}` },
      body: JSON.stringify(coach),
    });
    console.log("Coach created:", await res.json());
  }
}

// Poblar equipos con coach_id
async function seedTeams() {
  const teams = [
    { team_id: 1, name: "Barcelona SC", shortname: "BSC", city: "Guayaquil", coach_id: 101 },
    { team_id: 2, name: "Emelec", shortname: "EME", city: "Guayaquil", coach_id: 102 },
    { team_id: 3, name: "Dep. Cuenca", shortname: "DCU", city: "Cuenca", coach_id: 103 },
    { team_id: 4, name: "LDU Quito", shortname: "LDU", city: "Quito", coach_id: 104 },
    { team_id: 5, name: "Ind. del Valle", shortname: "IDV", city: "Sangolqui", coach_id: 105 },
    { team_id: 6, name: "Aucas", shortname: "AUC", city: "Quito", coach_id: 106 },
  ];

  for (const team of teams) {
    const res = await fetch(`${API_URL}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs.JWT_TOKEN}` },
      body: JSON.stringify(team),
    });
    console.log("Team created:", await res.json());
  }
}

// Poblar partidos
async function seedMatches() {
  const matches = [
    {
      match_id: 101,
      championship_id: 10,
      home_team_id: 1,
      away_team_id: 2,
      date: "2026-03-20T15:00:00.000Z",
      state: 0, // scheduled
      city: "Guayaquil",
      venue: "Estadio Monumental",
      match_events: []
    },
    {
      match_id: 102,
      championship_id: 10,
      home_team_id: 3,
      away_team_id: 4,
      date: "2026-03-21T18:00:00.000Z",
      state: 1, // live
      city: "Quito",
      venue: "Estadio Casa Blanca",
      match_events: [{ evento: "gol", minuto: 10, player_id: 201, team_id: 1 }]
    },
    {
      match_id: 103,
      championship_id: 11,
      home_team_id: 5,
      away_team_id: 6,
      date: "2026-03-22T20:00:00.000Z",
      state: 2, // finished
      city: "Cuenca",
      venue: "Estadio Alejandro Serrano",
      match_events: [{ evento: "gol", minuto: 30, player_id: 202, team_id: 2 }]
    },
    {
      match_id: 104,
      championship_id: 10,
      home_team_id: 2,
      away_team_id: 3,
      date: "2026-03-23T17:00:00.000Z",
      state: 3, // suspended
      city: "Quito",
      venue: "Estadio Olímpico Atahualpa",
      match_events: []
    },
    {
      match_id: 105,
      championship_id: 11,
      home_team_id: 4,
      away_team_id: 5,
      date: "2026-03-24T19:00:00.000Z",
      state: 4, // postponed
      city: "Sangolquí",
      venue: "Estadio IDV",
      match_events: []
    },
    {
      match_id: 106,
      championship_id: 10,
      home_team_id: 6,
      away_team_id: 1,
      date: "2026-03-25T16:00:00.000Z",
      state: 5, // cancelled
      city: "Quito",
      venue: "Estadio Gonzalo Pozo",
      match_events: []
    },
    {
      match_id: 107,
      championship_id: 11,
      home_team_id: 2,
      away_team_id: 6,
      date: "2026-03-26T20:00:00.000Z",
      state: 6, // unknown
      city: "Guayaquil",
      venue: "Estadio Capwell",
      match_events: []
    }
  ];

  for (const match of matches) {
    const res = await fetch(`${API_URL}/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${envs.JWT_TOKEN}`,
      },
      body: JSON.stringify(match),
    });

    console.log("Match created:", await res.json());
  }
}


// Poblar jugadores
async function seedPlayers() {
  const players = [
    {
      player_id: 201,
      number: 10,
      name: "Juan",
      lastname: "Pérez",
      weight: 72,
      height: 175,
      primary_position: 9,
      secondary_position: 11,
      home_country: "Ecuador",
      state_id: 1,
      type: 1,
      team_id: 1,
      player_statics: { partidos_jugados: 20, goles: 15, asistencias: 5, tarjetas_amarillas: 2, tarjetas_rojas: 0 }
    },
    {
      player_id: 202,
      number: 7,
      name: "Carlos",
      lastname: "Gómez",
      weight: 70,
      height: 178,
      primary_position: 7,
      home_country: "Ecuador",
      state_id: 1,
      type: 1,
      team_id: 2,
      player_statics: { partidos_jugados: 18, goles: 8, asistencias: 7, tarjetas_amarillas: 3, tarjetas_rojas: 1 }
    }
  ];

  for (const player of players) {
    const res = await fetch(`${API_URL}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs.JWT_TOKEN}` },
      body: JSON.stringify(player),
    });
    console.log("Player created:", await res.json());
  }
}

// Poblar relación MatchPlayer
async function seedMatchPlayers() {
  const matchPlayers = [
    { player_id: 201, match_id: 101, score: 2 }, // Juan Pérez jugó el partido 101 y anotó 2
    { player_id: 202, match_id: 101, score: 1 }, // Carlos Gómez jugó el partido 101 y anotó 1
    { player_id: 201, match_id: 102, score: 0 }, // Juan Pérez jugó el partido 102
    { player_id: 202, match_id: 103, score: 0 }  // Carlos Gómez jugó el partido 103
  ];

  for (const mp of matchPlayers) {
    const res = await fetch(`${API_URL}/matchplayers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs.JWT_TOKEN}` },
      body: JSON.stringify(mp),
    });
    console.log("MatchPlayer created:", await res.json());
  }
}

// Eliminar datos existentes según IDs
async function clearDatabase() {
  // IDs que definiste en tu seeding
  const championshipIds = [10, 11];
  const coachIds = [101, 102, 103, 104, 105, 106];
  const teamIds = [1, 2, 3, 4, 5, 6];
  const matchIds = [101, 102, 103, 104, 105, 106, 107];
  const playerIds = [201, 202];
  const matchPlayerIds = [
    { player_id: 201, match_id: 101 },
    { player_id: 202, match_id: 101 },
    { player_id: 201, match_id: 102 },
    { player_id: 202, match_id: 103 },
  ];

  // Campeonatos
  for (const id of championshipIds) {
    await fetch(`${API_URL}/championships/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${envs.JWT_TOKEN}` },
    }).then(res => console.log("Deleted championship", id));
  }

  // Coaches
  for (const id of coachIds) {
    await fetch(`${API_URL}/coaches/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${envs.JWT_TOKEN}` },
    }).then(res => console.log("Deleted coach", id));
  }

  // Equipos
  for (const id of teamIds) {
    await fetch(`${API_URL}/teams/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${envs.JWT_TOKEN}` },
    }).then(res => console.log("Deleted team", id));
  }

  // Partidos
  for (const id of matchIds) {
    await fetch(`${API_URL}/matches/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${envs.JWT_TOKEN}` },
    }).then(res => console.log("Deleted match", id));
  }

  // Jugadores
  for (const id of playerIds) {
    await fetch(`${API_URL}/players/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${envs.JWT_TOKEN}` },
    }).then(res => console.log("Deleted player", id));
  }

  // Relación MatchPlayer (si tu API requiere ambos IDs en la ruta)
  for (const mp of matchPlayerIds) {
    await fetch(`${API_URL}/matchplayers/${mp.match_id}/${mp.player_id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${envs.JWT_TOKEN}` },
    }).then(res => console.log("Deleted matchplayer", mp));
  }
}

// Ejecutar todo en orden
async function main() {
  await clearDatabase();
  await seedChampionships();
  await seedCoaches();
  await seedTeams();
  await seedMatches();
  await seedPlayers();
  await seedMatchPlayers();
}

main().catch(err => console.error(err));
