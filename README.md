# Iceplay-Fropen
Backend Iceplay

## Configuración de bases de datos y Docker

1. Verifica `docker-compose.yml` contiene los servicios:
   - `mongo-db` (mongo:6.0.6)
   - `postgres` (postgres:16-alpine)

2. Levanta los contenedores:

```bash
docker-compose down
docker-compose up -d
```

3. Confirma que los contenedores estén en estado `running`:

```bash
docker ps
```

4. Instala dependencias si no lo hiciste:

```bash
npm install
```

5. Genera el esquema Drizzle y la migración:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

6. Inicia la aplicación:

```bash
npm run dev
```

## Poblar la base de datos

```
ts-node public/seed.ts
```

## Consultas para ver todos los partidos

```
http://localhost:3001/api/matches/search


http://localhost:3001/api/matches/search?championship_id=10&state=1&date=2026-03-15T18:00:00.000Z
```

## Consultas de todas las entidades
Solo se mostrarán los post, update tiene la misma estructura, delete y get de 1 elemento necesitan un id

### ChampionshipTeams
```
localhost:3001/api/championshipTeams
```

### Championships
```
localhost:3001/api/championships
```

### Matches
```
localhost:3001/api/matches
```


