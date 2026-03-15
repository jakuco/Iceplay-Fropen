import {
    pgTable,
    serial,
    integer,
    varchar,
    text,
    boolean,
    numeric,
    timestamp,
    date,
    time,
    primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =============================================================================
// ORGANIZATION
// =============================================================================

export const organizations = pgTable("organizations", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    logo: varchar("logo", { length: 500 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    primaryColor: varchar("primary_color", { length: 7 }),
    secondaryColor: varchar("secondary_color", { length: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
    users: many(users),
    championships: many(championships),
}));

// =============================================================================
// USER / ROLE / PERMISSION
// =============================================================================

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id),
    nombre: varchar("nombre", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [users.organizationId],
        references: [organizations.id],
    }),
    userRoles: many(userRoles),
}));

export const roles = pgTable("roles", {
    id: serial("id").primaryKey(),
    nombre: varchar("nombre", { length: 100 }).notNull(),
    descripcion: text("descripcion"),
});

export const rolesRelations = relations(roles, ({ many }) => ({
    userRoles: many(userRoles),
    rolePermissions: many(rolePermissions),
}));

export const permissions = pgTable("permissions", {
    id: serial("id").primaryKey(),
    action: varchar("action", { length: 50 }).notNull(), // read | write | delete
    recurso: varchar("recurso", { length: 100 }).notNull(), // users | products | reports
});

export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions),
}));

export const userRoles = pgTable(
    "user_roles",
    {
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        roleId: integer("role_id")
            .notNull()
            .references(() => roles.id),
    },
    (t) => [
        primaryKey({ columns: [t.userId, t.roleId] }),
    ]
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id],
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id],
    }),
}));

export const rolePermissions = pgTable(
    "role_permissions",
    {
        roleId: integer("role_id")
            .notNull()
            .references(() => roles.id),
        permissionId: integer("permission_id")
            .notNull()
            .references(() => permissions.id),
    },
    (t) => [
        primaryKey({ columns: [t.roleId, t.permissionId] }),
    ]
);

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));

// =============================================================================
// SPORT
// =============================================================================

export const sports = pgTable("sports", {
    id: serial("id").primaryKey(),
    icon: varchar("icon", { length: 500 }),
    periods: numeric("periods"),
    matchTypeSingular: varchar("match_type_singular", { length: 100 }),
    matchTypePlural: varchar("match_type_plural", { length: 100 }),
    periodDuration: numeric("period_duration"),
    periodLabel: varchar("period_label", { length: 50 }),
    periodLabelPlural: varchar("period_label_plural", { length: 50 }),
});

export const sportsRelations = relations(sports, ({ many }) => ({
    championships: many(championships),
    sportPositions: many(sportPositions),
    sportMatchRules: many(sportMatchRules),
    sportTypeMatchEvents: many(sportTypeMatchEvents),
    matchRulesChampionshipSports: many(matchRulesChampionshipSports),
}));

// =============================================================================
// POSITION
// =============================================================================

export const positions = pgTable("positions", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    abbreviation: varchar("abbreviation", { length: 10 }),
});

export const positionsRelations = relations(positions, ({ many }) => ({
    sportPositions: many(sportPositions),
    players: many(players),
}));

export const sportPositions = pgTable(
    "sport_positions",
    {
        sportId: integer("sport_id")
            .notNull()
            .references(() => sports.id),
        positionsId: integer("positions_id")
            .notNull()
            .references(() => positions.id),
    },
    (t) => [
        primaryKey({ columns: [t.sportId, t.positionsId] }),
    ]
);

export const sportPositionsRelations = relations(sportPositions, ({ one }) => ({
    sport: one(sports, {
        fields: [sportPositions.sportId],
        references: [sports.id],
    }),
    position: one(positions, {
        fields: [sportPositions.positionsId],
        references: [positions.id],
    }),
}));

// =============================================================================
// MATCH RULES
// =============================================================================

export const matchRules = pgTable("match_rules", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    value: integer("value"), // valor por defecto
});

export const matchRulesRelations = relations(matchRules, ({ many }) => ({
    sportMatchRules: many(sportMatchRules),
    matchRulesChampionshipSports: many(matchRulesChampionshipSports),
}));

export const sportMatchRules = pgTable(
    "sport_match_rules",
    {
        sportId: integer("sport_id")
            .notNull()
            .references(() => sports.id),
        matchRulesId: integer("match_rules_id")
            .notNull()
            .references(() => matchRules.id),
    },
    (t) => [
        primaryKey({ columns: [t.sportId, t.matchRulesId] }),
    ]
);

export const sportMatchRulesRelations = relations(sportMatchRules, ({ one }) => ({
    sport: one(sports, {
        fields: [sportMatchRules.sportId],
        references: [sports.id],
    }),
    matchRule: one(matchRules, {
        fields: [sportMatchRules.matchRulesId],
        references: [matchRules.id],
    }),
}));

// =============================================================================
// TYPE MATCH EVENT
// =============================================================================

export const typeMatchEvents = pgTable("type_match_events", {
    id: serial("id").primaryKey(),
    label: varchar("label", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 500 }),
    color: varchar("color", { length: 7 }),
    matchPoint: integer("match_point").default(0),
    category: varchar("category", { length: 50 }).notNull(), // scoring | card | substitution | other
    standingPoints: integer("standing_points").default(0),
});

export const typeMatchEventsRelations = relations(typeMatchEvents, ({ many }) => ({
    sportTypeMatchEvents: many(sportTypeMatchEvents),
    matchEvents: many(matchEvents),
}));

export const sportTypeMatchEvents = pgTable(
    "sport_type_match_events",
    {
        sportId: integer("sport_id")
            .notNull()
            .references(() => sports.id),
        typeMatchEventId: integer("type_match_event_id")
            .notNull()
            .references(() => typeMatchEvents.id),
    },
    (t) => [
        primaryKey({ columns: [t.sportId, t.typeMatchEventId] }),
    ]
);

export const sportTypeMatchEventsRelations = relations(sportTypeMatchEvents, ({ one }) => ({
    sport: one(sports, {
        fields: [sportTypeMatchEvents.sportId],
        references: [sports.id],
    }),
    typeMatchEvent: one(typeMatchEvents, {
        fields: [sportTypeMatchEvents.typeMatchEventId],
        references: [typeMatchEvents.id],
    }),
}));

// =============================================================================
// SOCIAL NETWORK
// =============================================================================

export const socialNetworks = pgTable("social_networks", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 500 }),
});

export const socialNetworksRelations = relations(socialNetworks, ({ many }) => ({
    socialLinks: many(socialLinks),
}));

// =============================================================================
// CHAMPIONSHIP
// =============================================================================

export const championships = pgTable("championships", {
    id: serial("id").primaryKey(),
    organizationId: integer("organization_id")
        .notNull()
        .references(() => organizations.id),
    sportId: integer("sport_id")
        .notNull()
        .references(() => sports.id),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    season: varchar("season", { length: 50 }),
    logo: varchar("logo", { length: 500 }),
    status: integer("status").default(0),
    registrationStartDate: date("registration_start_date"),
    registrationEndDate: date("registration_end_date"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    maxTeams: integer("max_teams"),
    maxPlayersPerTeam: integer("max_players_per_team"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const championshipsRelations = relations(championships, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [championships.organizationId],
        references: [organizations.id],
    }),
    sport: one(sports, {
        fields: [championships.sportId],
        references: [sports.id],
    }),
    teams: many(teams),
    phases: many(phases),
    socialLinks: many(socialLinks),
    matchRulesChampionshipSports: many(matchRulesChampionshipSports),
}));

export const socialLinks = pgTable("social_links", {
    id: serial("id").primaryKey(),
    championshipId: integer("championship_id")
        .notNull()
        .references(() => championships.id),
    socialNetworkId: integer("social_network_id")
        .notNull()
        .references(() => socialNetworks.id),
    link: varchar("link", { length: 500 }).notNull(),
});

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
    championship: one(championships, {
        fields: [socialLinks.championshipId],
        references: [championships.id],
    }),
    socialNetwork: one(socialNetworks, {
        fields: [socialLinks.socialNetworkId],
        references: [socialNetworks.id],
    }),
}));

export const matchRulesChampionshipSports = pgTable(
    "match_rules_championship_sports",
    {
        matchRulesId: integer("match_rules_id")
            .notNull()
            .references(() => matchRules.id),
        championshipId: integer("championship_id")
            .notNull()
            .references(() => championships.id),
        sportId: integer("sport_id")
            .notNull()
            .references(() => sports.id),
        value: integer("value"),
    },
    (t) => [
        primaryKey({ columns: [t.matchRulesId, t.championshipId, t.sportId] }),
    ]
);

export const matchRulesChampionshipSportsRelations = relations(
    matchRulesChampionshipSports,
    ({ one }) => ({
        matchRule: one(matchRules, {
            fields: [matchRulesChampionshipSports.matchRulesId],
            references: [matchRules.id],
        }),
        championship: one(championships, {
            fields: [matchRulesChampionshipSports.championshipId],
            references: [championships.id],
        }),
        sport: one(sports, {
            fields: [matchRulesChampionshipSports.sportId],
            references: [sports.id],
        }),
    })
);

// =============================================================================
// TEAM
// =============================================================================

export const teams = pgTable("teams", {
    id: serial("id").primaryKey(),
    championshipId: integer("championship_id")
        .notNull()
        .references(() => championships.id),
    name: varchar("name", { length: 255 }).notNull(),
    shortname: varchar("shortname", { length: 50 }),
    slug: varchar("slug", { length: 255 }).notNull(),
    logoUrl: varchar("logo_url", { length: 500 }),
    documentURL: varchar("document_url", { length: 500 }),
    primaryColor: varchar("primary_color", { length: 7 }),
    secondaryColor: varchar("secondary_color", { length: 7 }),
    foundedYear: integer("founded_year"),
    homeVenue: integer("home_venue"),
    location: varchar("location", { length: 255 }),
    isActive: boolean("is_active").default(true),
    hasActiveMatches: boolean("has_active_matches").default(false),
    coachName: varchar("coach_name", { length: 255 }),
    coachPhone: varchar("coach_phone", { length: 50 }),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
    championship: one(championships, {
        fields: [teams.championshipId],
        references: [championships.id],
    }),
    players: many(players),
    teamGroupTeams: many(teamGroupTeams),
    homeMatches: many(matches, { relationName: "homeTeam" }),
    awayMatches: many(matches, { relationName: "awayTeam" }),
    matchEvents: many(matchEvents),
}));

// =============================================================================
// PLAYER
// =============================================================================

export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
        .notNull()
        .references(() => teams.id),
    positionId: integer("position_id").references(() => positions.id),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    nickName: varchar("nick_name", { length: 100 }),
    number: integer("number"),
    birthDate: date("birth_date"),
    height: numeric("height", { precision: 4, scale: 2 }),
    weight: numeric("weight", { precision: 5, scale: 2 }),
    status: varchar("status", { length: 50 }).default("Active"),
    suspensionEndDate: date("suspension_end_date"),
    suspensionReason: text("suspension_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playersRelations = relations(players, ({ one, many }) => ({
    team: one(teams, {
        fields: [players.teamId],
        references: [teams.id],
    }),
    position: one(positions, {
        fields: [players.positionId],
        references: [positions.id],
    }),
    matchPlayers: many(matchPlayers),
    matchEvents: many(matchEvents),
}));

// =============================================================================
// PHASE
// =============================================================================

export const phases = pgTable("phases", {
    id: serial("id").primaryKey(),
    championshipId: integer("championship_id")
        .notNull()
        .references(() => championships.id),
    name: varchar("name", { length: 255 }).notNull(),
    phaseType: varchar("phase_type", { length: 50 }).notNull(), // swiss | league | knockout | groups
    phaseOrder: integer("phase_order").notNull(),
    status: varchar("status", { length: 50 }).default("pending"),
});

export const phasesRelations = relations(phases, ({ one, many }) => ({
    championship: one(championships, {
        fields: [phases.championshipId],
        references: [championships.id],
    }),
    groupTeams: many(groupTeams),
    phaseSwiss: many(phaseSwiss),
    phaseLeague: many(phaseLeague),
    phaseKnockout: many(phaseKnockout),
    phaseGroups: many(phaseGroups),
}));

export const phaseSwiss = pgTable("phase_swiss", {
    id: serial("id").primaryKey(),
    phaseId: integer("phase_id")
        .notNull()
        .references(() => phases.id),
    numRounds: integer("num_rounds"),
    pairingSystem: varchar("pairing_system", { length: 20 }),
    firstRound: varchar("first_round", { length: 20 }),
    allowRematch: boolean("allow_rematch").default(false),
    tiebreakOrder: text("tiebreak_order"),
    directAdvancedCount: integer("direct_advanced_count"),
    playoffCount: integer("playoff_count"),
});

export const phaseSwissRelations = relations(phaseSwiss, ({ one }) => ({
    phase: one(phases, {
        fields: [phaseSwiss.phaseId],
        references: [phases.id],
    }),
}));

export const phaseLeague = pgTable("phase_league", {
    id: serial("id").primaryKey(),
    phaseId: integer("phase_id")
        .notNull()
        .references(() => phases.id),
    legs: integer("legs"),
    tiebreakOrder: text("tiebreak_order"), // points | diff | gf | h2h | random
    advanceCount: integer("advance_count"),
});

export const phaseLeagueRelations = relations(phaseLeague, ({ one }) => ({
    phase: one(phases, {
        fields: [phaseLeague.phaseId],
        references: [phases.id],
    }),
}));

export const phaseKnockout = pgTable("phase_knockout", {
    id: serial("id").primaryKey(),
    phaseId: integer("phase_id")
        .notNull()
        .references(() => phases.id),
    legs: integer("legs"),
    fixtureMode: varchar("fixture_mode", { length: 20 }),
    seeding: varchar("seeding", { length: 20 }),
    byeStrategy: varchar("bye_strategy", { length: 20 }),
    tieBreak: varchar("tie_break", { length: 20 }),
    awayGoalsRule: boolean("away_goals_rule").default(false),
    thirdPlaceMatch: boolean("third_place_match").default(false),
});

export const phaseKnockoutRelations = relations(phaseKnockout, ({ one }) => ({
    phase: one(phases, {
        fields: [phaseKnockout.phaseId],
        references: [phases.id],
    }),
}));

export const phaseGroups = pgTable("phase_groups", {
    id: serial("id").primaryKey(),
    phaseId: integer("phase_id")
        .notNull()
        .references(() => phases.id),
    numGroups: integer("num_groups"),
    teamsPerGroup: integer("teams_per_group"),
    assignment: varchar("assignment", { length: 20 }),
    legs: integer("legs"),
    advancePerGroup: integer("advance_per_group"),
    advanceBestThirds: integer("advance_best_thirds"),
    tiebreakOrder: text("tiebreak_order"),
});

export const phaseGroupsRelations = relations(phaseGroups, ({ one }) => ({
    phase: one(phases, {
        fields: [phaseGroups.phaseId],
        references: [phases.id],
    }),
}));

// =============================================================================
// GROUP TEAM
// =============================================================================

export const groupTeams = pgTable("group_teams", {
    id: serial("id").primaryKey(),
    phaseId: integer("phase_id")
        .notNull()
        .references(() => phases.id),
    name: varchar("name", { length: 255 }),
    type: varchar("type", { length: 50 }), // group | direct | playoff
    order: integer("order"),
});

export const groupTeamsRelations = relations(groupTeams, ({ one, many }) => ({
    phase: one(phases, {
        fields: [groupTeams.phaseId],
        references: [phases.id],
    }),
    teamGroupTeams: many(teamGroupTeams),
    matches: many(matches),
}));

export const teamGroupTeams = pgTable(
    "team_group_teams",
    {
        teamId: integer("team_id")
            .notNull()
            .references(() => teams.id),
        groupTeamId: integer("group_team_id")
            .notNull()
            .references(() => groupTeams.id),
    },
    (t) => [
        primaryKey({ columns: [t.teamId, t.groupTeamId] }),
    ]
);

export const teamGroupTeamsRelations = relations(teamGroupTeams, ({ one }) => ({
    team: one(teams, {
        fields: [teamGroupTeams.teamId],
        references: [teams.id],
    }),
    groupTeam: one(groupTeams, {
        fields: [teamGroupTeams.groupTeamId],
        references: [groupTeams.id],
    }),
}));

// =============================================================================
// MATCH
// =============================================================================

export const matches = pgTable("matches", {
    id: serial("id").primaryKey(),
    groupTeamId: integer("group_team_id")
        .notNull()
        .references(() => groupTeams.id),
    homeTeamId: integer("home_team_id")
        .notNull()
        .references(() => teams.id),  // <- sin relationName
    awayTeamId: integer("away_team_id")
        .notNull()
        .references(() => teams.id),
    homeScore: integer("home_score").default(0),
    awayScore: integer("away_score").default(0),
    status: varchar("status", { length: 50 }).default("scheduled"),
    round: numeric("round"),
    matchday: integer("matchday"),
    scheduledDate: date("scheduled_date"),
    scheduledTime: time("scheduled_time"),
    actualStartTime: timestamp("actual_start_time"),
    actualEndTime: timestamp("actual_end_time"),
    venue: varchar("venue", { length: 255 }),
    city: varchar("city", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const matchesRelations = relations(matches, ({ one, many }) => ({
    groupTeam: one(groupTeams, {
        fields: [matches.groupTeamId],
        references: [groupTeams.id],
    }),
    homeTeam: one(teams, {
        fields: [matches.homeTeamId],
        references: [teams.id],
        relationName: "homeTeam",
    }),
    awayTeam: one(teams, {
        fields: [matches.awayTeamId],
        references: [teams.id],
        relationName: "awayTeam",
    }),
    matchEvents: many(matchEvents),
    matchPlayers: many(matchPlayers),
}));

// =============================================================================
// MATCH EVENT
// =============================================================================

export const matchEvents = pgTable("match_events", {
    matchId: integer("match_id")
        .notNull()
        .references(() => matches.id),
    typeMatchEventId: integer("type_match_event_id")
        .notNull()
        .references(() => typeMatchEvents.id),
    playerId: integer("player_id").references(() => players.id),
    teamId: integer("team_id").references(() => teams.id),
    time: integer("time").notNull(), // en segundos
});

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
    match: one(matches, {
        fields: [matchEvents.matchId],
        references: [matches.id],
    }),
    typeMatchEvent: one(typeMatchEvents, {
        fields: [matchEvents.typeMatchEventId],
        references: [typeMatchEvents.id],
    }),
    player: one(players, {
        fields: [matchEvents.playerId],
        references: [players.id],
    }),
    team: one(teams, {
        fields: [matchEvents.teamId],
        references: [teams.id],
    }),
}));

// =============================================================================
// MATCH PLAYER
// =============================================================================

export const matchPlayers = pgTable(
    "match_players",
    {
        matchId: integer("match_id")
            .notNull()
            .references(() => matches.id),
        playerId: integer("player_id")
            .notNull()
            .references(() => players.id),
    },
    (t) => [
        primaryKey({ columns: [t.matchId, t.playerId] }),
    ]
);

export const matchPlayersRelations = relations(matchPlayers, ({ one }) => ({
    match: one(matches, {
        fields: [matchPlayers.matchId],
        references: [matches.id],
    }),
    player: one(players, {
        fields: [matchPlayers.playerId],
        references: [players.id],
    }),
}));