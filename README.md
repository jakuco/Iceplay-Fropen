# Iceplay-Fropen
Backend Iceplay


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
