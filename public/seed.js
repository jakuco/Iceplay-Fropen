"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const envs_1 = require("../src/config/envs");
const API_URL = envs_1.envs.API_URL;
// Poblar campeonatos
function seedChampionships() {
    return __awaiter(this, void 0, void 0, function* () {
        const championships = [
            { championship_id: 10, name: "Liga Nacional", type_id: 1, format_id: 2, state_id: 1, season_id: 2026 },
            { championship_id: 11, name: "Copa Internacional", type_id: 2, format_id: 1, state_id: 1, season_id: 2026 },
        ];
        for (const champ of championships) {
            const res = yield fetch(`${API_URL}/championships`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs_1.envs.JWT_TOKEN}` },
                body: JSON.stringify(champ),
            });
            console.log("Championship created:", yield res.json());
        }
    });
}
// Poblar coaches
function seedCoaches() {
    return __awaiter(this, void 0, void 0, function* () {
        const coaches = [
            { coach_id: 101, name: "Fabián Bustos", phone: "0999999999", email: "fbustos@club.com" },
            { coach_id: 102, name: "Miguel Rondelli", phone: "0988888888", email: "mrondelli@club.com" },
            { coach_id: 103, name: "Gabriel Schurrer", phone: "0977777777", email: "gschurrer@club.com" },
            { coach_id: 104, name: "Luis Zubeldia", phone: "0966666666", email: "lzubeldia@club.com" },
            { coach_id: 105, name: "M. Anselmi", phone: "0955555555", email: "manselmi@club.com" },
            { coach_id: 106, name: "Cesar Farias", phone: "0944444444", email: "cfarias@club.com" },
        ];
        for (const coach of coaches) {
            const res = yield fetch(`${API_URL}/coaches`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs_1.envs.JWT_TOKEN}` },
                body: JSON.stringify(coach),
            });
            console.log("Coach created:", yield res.json());
        }
    });
}
// Poblar equipos con coach_id
function seedTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        const teams = [
            { team_id: 1, name: "Barcelona SC", shortname: "BSC", city: "Guayaquil", coach_id: 101 },
            { team_id: 2, name: "Emelec", shortname: "EME", city: "Guayaquil", coach_id: 102 },
            { team_id: 3, name: "Dep. Cuenca", shortname: "DCU", city: "Cuenca", coach_id: 103 },
            { team_id: 4, name: "LDU Quito", shortname: "LDU", city: "Quito", coach_id: 104 },
            { team_id: 5, name: "Ind. del Valle", shortname: "IDV", city: "Sangolqui", coach_id: 105 },
            { team_id: 6, name: "Aucas", shortname: "AUC", city: "Quito", coach_id: 106 },
        ];
        for (const team of teams) {
            const res = yield fetch(`${API_URL}/teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs_1.envs.JWT_TOKEN}` },
                body: JSON.stringify(team),
            });
            console.log("Team created:", yield res.json());
        }
    });
}
// Poblar partidos
function seedMatches() {
    return __awaiter(this, void 0, void 0, function* () {
        const matches = [
            {
                match_id: 101,
                championship_id: 10,
                home_team_id: 1,
                away_team_id: 2,
                date: "2026-03-15T15:00:00.000Z",
                state: 1,
                match_events: [
                    { evento: "gol", minuto: 15, player_id: 201, team_id: 1 },
                    { evento: "gol", minuto: 45, player_id: 202, team_id: 2 },
                    { evento: "gol", minuto: 70, player_id: 201, team_id: 1 },
                    { evento: "amarilla", minuto: 55, player_id: 202, team_id: 2 },
                    { evento: "entrada", minuto: 60, player_id: 203, team_id: 1 },
                    { evento: "salida", minuto: 60, player_id: 201, team_id: 1 }
                ]
            },
            {
                match_id: 102,
                championship_id: 10,
                home_team_id: 3,
                away_team_id: 4,
                date: "2026-03-15T18:00:00.000Z",
                state: 1,
                match_events: [
                    { evento: "gol", minuto: 22, player_id: 204, team_id: 3 },
                    { evento: "gol", minuto: 80, player_id: 205, team_id: 4 },
                    { evento: "amarilla", minuto: 30, player_id: 204, team_id: 3 }
                ]
            },
            {
                match_id: 103,
                championship_id: 11,
                home_team_id: 5,
                away_team_id: 6,
                date: "2026-03-16T20:00:00.000Z",
                state: 0,
                match_events: [
                // partido aún sin eventos
                ]
            }
        ];
        for (const match of matches) {
            const res = yield fetch(`${API_URL}/matches`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${envs_1.envs.JWT_TOKEN}`,
                },
                body: JSON.stringify(match),
            });
            console.log("Match created:", yield res.json());
        }
    });
}
// Poblar jugadores
function seedPlayers() {
    return __awaiter(this, void 0, void 0, function* () {
        const players = [
            {
                player_id: 201,
                number: 10,
                name: "Juan Pérez",
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
                name: "Carlos Gómez",
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
            const res = yield fetch(`${API_URL}/players`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs_1.envs.JWT_TOKEN}` },
                body: JSON.stringify(player),
            });
            console.log("Player created:", yield res.json());
        }
    });
}
// Poblar relación MatchPlayer
function seedMatchPlayers() {
    return __awaiter(this, void 0, void 0, function* () {
        const matchPlayers = [
            { player_id: 201, match_id: 101, score: 2 }, // Juan Pérez jugó el partido 101 y anotó 2
            { player_id: 202, match_id: 101, score: 1 }, // Carlos Gómez jugó el partido 101 y anotó 1
            { player_id: 201, match_id: 102, score: 0 }, // Juan Pérez jugó el partido 102
            { player_id: 202, match_id: 103, score: 0 } // Carlos Gómez jugó el partido 103
        ];
        for (const mp of matchPlayers) {
            const res = yield fetch(`${API_URL}/matchplayers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${envs_1.envs.JWT_TOKEN}` },
                body: JSON.stringify(mp),
            });
            console.log("MatchPlayer created:", yield res.json());
        }
    });
}
// Ejecutar todo en orden
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield seedChampionships();
        yield seedCoaches();
        yield seedTeams();
        yield seedMatches();
        yield seedPlayers();
        yield seedMatchPlayers();
    });
}
main().catch(err => console.error(err));
