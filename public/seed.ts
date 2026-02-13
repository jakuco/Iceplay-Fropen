import { envs } from "../src/config/envs";

const API_URL = envs.API_URL;

// Poblar campeonatos
async function seedChampionships() {
  const championships = [
    {
      championship_id: 10,
      name: "Liga Nacional",
      type_id: 1,
      format_id: 2,
      state_id: 1,
      season_id: 2026,
    },
    {
      championship_id: 11,
      name: "Copa Internacional",
      type_id: 2,
      format_id: 1,
      state_id: 1,
      season_id: 2026,
    },
  ];

  for (const champ of championships) {
    const res = await fetch(`${API_URL}/championships`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${envs.JWT_TOKEN}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${envs.JWT_TOKEN}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${envs.JWT_TOKEN}`,
      },
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
      date: "2026-03-15T15:00:00.000Z",
      state: 1,
      match_events: {},
    },
    {
      match_id: 102,
      championship_id: 10,
      home_team_id: 3,
      away_team_id: 4,
      date: "2026-03-15T18:00:00.000Z",
      state: 1,
      match_events: {},
    },
    {
      match_id: 103,
      championship_id: 11,
      home_team_id: 5,
      away_team_id: 6,
      date: "2026-03-16T20:00:00.000Z",
      state: 0,
      match_events: {},
    },
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

// Ejecutar todo en orden
async function main() {
  await seedChampionships();
  await seedCoaches();
  await seedTeams();
  await seedMatches();
}

main().catch(err => console.error(err));
