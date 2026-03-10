import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as schema from "../../src/data/drizzle/modelos/schema";
import { envs } from "../../src/config/envs"; // ajusta el path según tu proyecto

// ─── Conexión ─────────────────────────────────────────────────────────────────

const pool = new Pool({
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  user: envs.DB_USER,
  password: envs.DB_PASSWORD,
  database: envs.DB_NAME,
});

const db = drizzle(pool, { schema });

// ─── Aliases para claridad en joins con misma tabla ───────────────────────────

const homeTeam = schema.teams;
const awayTeam = schema.teams;

// ─── Queries ──────────────────────────────────────────────────────────────────

async function queries() {
  console.log("✅ Conectado\n");

  // ══════════════════════════════════════════════════════════════════════════
  // QUERY 1 — Partido con sus dos equipos
  // matches JOIN teams (homeTeamId) JOIN teams (awayTeamId)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("══ QUERY 1: Partido con sus equipos ══");

  const homeTeamsAlias = db
    .$with("home_teams")
    .as(db.select().from(schema.teams));

  const awayTeamsAlias = db
    .$with("away_teams")
    .as(db.select().from(schema.teams));

  const q1 = await db
    .select({
      id: schema.matches.id,
      homeScore: schema.matches.homeScore,
      awayScore: schema.matches.awayScore,
      status: schema.matches.status,
      homeTeam: {
        id: sql<number>`ht.id`,
        name: sql<string>`ht.name`,
      },
      awayTeam: {
        id: sql<number>`at.id`,
        name: sql<string>`at.name`,
      },
    })
    .from(schema.matches)
    .innerJoin(
      sql`teams ht`,
      sql`ht.id = ${schema.matches.homeTeamId}`
    )
    .innerJoin(
      sql`teams at`,
      sql`at.id = ${schema.matches.awayTeamId}`
    )
    .where(eq(schema.matches.id, 1));

  console.log(JSON.stringify(q1, null, 2));

  // ══════════════════════════════════════════════════════════════════════════
  // QUERY 2 — Partido con sus eventos y el tipo de cada evento
  // matches → match_events → type_match_events
  // Usamos SQL raw para construir el JSON anidado directamente en PostgreSQL,
  // igual que el pipeline anidado de MongoDB.
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n══ QUERY 2: Partido con sus eventos ══");

  const q2 = await db.execute(sql`
    SELECT
      m.id,
      m.home_score  AS "homeScore",
      m.away_score  AS "awayScore",
      m.status,
      COALESCE(
        json_agg(
          json_build_object(
            'playerId', me.player_id,
            'teamId',   me.team_id,
            'time',     me.time,
            'tipoEvento', json_build_object(
              'label',    tme.label,
              'category', tme.category
            )
          )
          ORDER BY me.time
        ) FILTER (WHERE me.match_id IS NOT NULL),
        '[]'
      ) AS eventos
    FROM matches m
    LEFT JOIN match_events  me  ON me.match_id          = m.id
    LEFT JOIN type_match_events tme ON tme.id = me.type_match_event_id
    WHERE m.id = 1
    GROUP BY m.id, m.home_score, m.away_score, m.status
  `);

  console.log(JSON.stringify(q2.rows, null, 2));

  // ══════════════════════════════════════════════════════════════════════════
  // QUERY 3 — Jugadores de un equipo con su posición
  // players JOIN positions (positionId)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n══ QUERY 3: Jugadores de un equipo ══");

  const q3 = await db
  .select({
    id: schema.players.id,
    firstName: schema.players.firstName,
    lastName: schema.players.lastName,
    number: schema.players.number,
    posicion: {
      code: schema.positions.code,
      label: schema.positions.label,
    },
  })
  .from(schema.players)
  .leftJoin(                                        // <- leftJoin en vez de innerJoin
    schema.positions,
    eq(schema.players.positionId, schema.positions.id)
  )
  .where(eq(schema.players.teamId, 1));             // ahora teamId=1 sí existe en la DB

  console.log(JSON.stringify(q3, null, 2));

  // ══════════════════════════════════════════════════════════════════════════
  // QUERY 4 — Todos los partidos de una fase
  // phases → group_teams → matches
  // Usamos SQL con json_agg anidado para replicar el pipeline de dos niveles
  // de MongoDB (phases → groupteams → matches).
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n══ QUERY 4: Partidos de una fase ══");

  const q4 = await db.execute(sql`
    SELECT
      p.id,
      p.name,
      p.phase_type AS "phaseType",
      COALESCE(
        json_agg(
          json_build_object(
            'id',       gt.id,
            'order',    gt."order",
            'partidos', (
              SELECT COALESCE(
                json_agg(
                  json_build_object(
                    'id',         m.id,
                    'homeTeamId', m.home_team_id,
                    'awayTeamId', m.away_team_id,
                    'homeScore',  m.home_score,
                    'awayScore',  m.away_score,
                    'status',     m.status,
                    'round',      m.round
                  )
                  ORDER BY m.round, m.id
                ),
                '[]'
              )
              FROM matches m
              WHERE m.group_team_id = gt.id
            )
          )
          ORDER BY gt."order"
        ) FILTER (WHERE gt.id IS NOT NULL),
        '[]'
      ) AS grupos
    FROM phases p
    LEFT JOIN group_teams gt ON gt.phase_id = p.id
    GROUP BY p.id, p.name, p.phase_type
    ORDER BY p.phase_order
  `);

  console.log(JSON.stringify(q4.rows, null, 2));

  // ══════════════════════════════════════════════════════════════════════════
  // QUERY 5 — Tabla de posiciones
  // Replicamos el $concatArrays + $unwind de MongoDB usando UNION ALL en SQL.
  // Generamos dos filas por partido (una por equipo local, otra por visitante)
  // y luego agrupamos para sumar puntos, GF, GC, etc.
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n══ QUERY 5: Tabla de posiciones ══");

  const q5 = await db.execute(sql`
    WITH partidos_por_equipo AS (
      -- Fila para el equipo local
      SELECT
        home_team_id                                          AS equipo_id,
        CASE
          WHEN home_score > away_score THEN 3
          WHEN home_score = away_score THEN 1
          ELSE 0
        END                                                   AS puntos,
        home_score                                            AS gf,
        away_score                                            AS gc,
        (home_score > away_score)::int                        AS ganados,
        (home_score = away_score)::int                        AS empatados,
        (home_score < away_score)::int                        AS perdidos
      FROM matches
      WHERE status = 'finished'

      UNION ALL

      -- Fila para el equipo visitante
      SELECT
        away_team_id,
        CASE
          WHEN away_score > home_score THEN 3
          WHEN away_score = home_score THEN 1
          ELSE 0
        END,
        away_score,
        home_score,
        (away_score > home_score)::int,
        (away_score = home_score)::int,
        (away_score < home_score)::int
      FROM matches
      WHERE status = 'finished'
    ),
    tabla AS (
      SELECT
        equipo_id,
        SUM(puntos)    AS puntos,
        COUNT(*)       AS jugados,
        SUM(ganados)   AS ganados,
        SUM(empatados) AS empatados,
        SUM(perdidos)  AS perdidos,
        SUM(gf)        AS gf,
        SUM(gc)        AS gc,
        SUM(gf) - SUM(gc) AS dg
      FROM partidos_por_equipo
      GROUP BY equipo_id
    )
    SELECT
      t.name   AS equipo,
      tb.puntos,
      tb.jugados,
      tb.ganados,
      tb.empatados,
      tb.perdidos,
      tb.gf,
      tb.gc,
      tb.dg
    FROM tabla tb
    JOIN teams t ON t.id = tb.equipo_id
    ORDER BY tb.puntos DESC, tb.dg DESC, tb.gf DESC
  `);

  console.log(JSON.stringify(q5.rows, null, 2));

  // ══════════════════════════════════════════════════════════════════════════
  // QUERY 6 — Campeonato completo (organización + deporte + equipos + fases)
  // championships JOIN organizations JOIN sports
  // + subqueries JSON para equipos y fases
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n══ QUERY 6: Campeonato completo ══");

  const q6 = await db.execute(sql`
    SELECT
      c.id,
      c.name,
      c.season,
      c.status,
      json_build_object(
        'name', o.name,
        'city', o.city
      ) AS organizacion,
      json_build_object(
        'matchTypeSingular', s.match_type_singular
      ) AS deporte,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id',        t.id,
              'name',      t.name,
              'shortname', t.shortname,
              'coachName', t.coach_name
            )
            ORDER BY t.id
          ),
          '[]'
        )
        FROM teams t
        WHERE t.championship_id = c.id
      ) AS equipos,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id',        ph.id,
              'name',      ph.name,
              'phaseType', ph.phase_type,
              'status',    ph.status
            )
            ORDER BY ph.phase_order
          ),
          '[]'
        )
        FROM phases ph
        WHERE ph.championship_id = c.id
      ) AS fases
    FROM championships c
    JOIN organizations o ON o.id = c.organization_id
    JOIN sports        s ON s.id = c.sport_id
    WHERE c.id = 1
  `);

  console.log(JSON.stringify(q6.rows, null, 2));

  // ── Guardar resultados ─────────────────────────────────────────────────────
  const resultados = {
    q1,
    q2: q2.rows,
    q3,
    q4: q4.rows,
    q5: q5.rows,
    q6: q6.rows,
  };

  const outDir = path.resolve(__dirname);

  const jsonPath = path.join(outDir, "query_results_psql.json");
  fs.writeFileSync(jsonPath, JSON.stringify(resultados, null, 2), "utf-8");
  console.log(`\n💾 JSON guardado en: ${jsonPath}`);

  const descripciones: Record<string, string> = {
    q1: "Partido con sus dos equipos (homeTeam y awayTeam resueltos desde teams)",
    q2: "Partido con sus eventos y el tipo de cada evento (match_events → type_match_events)",
    q3: "Jugadores de un equipo con su posición (players → positions)",
    q4: "Todos los partidos de una fase (phases → group_teams → matches)",
    q5: "Tabla de posiciones: puntos, ganados, empatados, perdidos, GF, GC, DG por equipo",
    q6: "Campeonato completo: organización + deporte + equipos + fases",
  };

  const lines: string[] = [];
  for (const [key, value] of Object.entries(resultados)) {
    const sep = "═".repeat(60);
    lines.push(sep);
    lines.push(`  ${key.toUpperCase()} — ${descripciones[key]}`);
    lines.push(sep);
    lines.push(JSON.stringify(value, null, 2));
    lines.push("");
  }

  const txtPath = path.join(outDir, "query_results_psql.txt");
  fs.writeFileSync(txtPath, lines.join("\n"), "utf-8");
  console.log(`📄 TXT  guardado en: ${txtPath}`);

  await pool.end();
  console.log("\n✅ Queries completadas");
}

queries().catch((err) => {
  console.error("❌ Error:", err);
  pool.end();
  process.exit(1);
});