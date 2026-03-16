CREATE TABLE "championships" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"sport_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"season" varchar(50),
	"logo" varchar(500),
	"status" integer DEFAULT 0,
	"registration_start_date" date,
	"registration_end_date" date,
	"start_date" date,
	"end_date" date,
	"max_teams" integer,
	"max_players_per_team" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "championships_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "group_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"name" varchar(255),
	"type" varchar(50),
	"order" integer
);
--> statement-breakpoint
CREATE TABLE "match_events" (
	"match_id" integer NOT NULL,
	"type_match_event_id" integer NOT NULL,
	"player_id" integer,
	"team_id" integer,
	"time" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_players" (
	"match_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	CONSTRAINT "match_players_match_id_player_id_pk" PRIMARY KEY("match_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "match_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" integer
);
--> statement-breakpoint
CREATE TABLE "match_rules_championship_sports" (
	"match_rules_id" integer NOT NULL,
	"championship_id" integer NOT NULL,
	"sport_id" integer NOT NULL,
	"value" integer,
	CONSTRAINT "match_rules_championship_sports_match_rules_id_championship_id_sport_id_pk" PRIMARY KEY("match_rules_id","championship_id","sport_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_team_id" integer NOT NULL,
	"home_team_id" integer NOT NULL,
	"away_team_id" integer NOT NULL,
	"home_score" integer DEFAULT 0,
	"away_score" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'scheduled',
	"round" numeric,
	"matchday" integer,
	"scheduled_date" date,
	"scheduled_time" time,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"venue" varchar(255),
	"city" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo" varchar(500),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"city" varchar(100),
	"country" varchar(100),
	"primary_color" varchar(7),
	"secondary_color" varchar(7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(50) NOT NULL,
	"recurso" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phase_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"num_groups" integer,
	"teams_per_group" integer,
	"assignment" varchar(20),
	"legs" integer,
	"advance_per_group" integer,
	"advance_best_thirds" integer,
	"tiebreak_order" text
);
--> statement-breakpoint
CREATE TABLE "phase_knockout" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"legs" integer,
	"fixture_mode" varchar(20),
	"seeding" varchar(20),
	"bye_strategy" varchar(20),
	"tie_break" varchar(20),
	"away_goals_rule" boolean DEFAULT false,
	"third_place_match" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "phase_league" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"legs" integer,
	"tiebreak_order" text,
	"advance_count" integer
);
--> statement-breakpoint
CREATE TABLE "phase_swiss" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"num_rounds" integer,
	"pairing_system" varchar(20),
	"first_round" varchar(20),
	"allow_rematch" boolean DEFAULT false,
	"tiebreak_order" text,
	"direct_advanced_count" integer,
	"playoff_count" integer
);
--> statement-breakpoint
CREATE TABLE "phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"championship_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"phase_type" varchar(50) NOT NULL,
	"phase_order" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"position_id" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"nick_name" varchar(100),
	"number" integer,
	"birth_date" date,
	"height" numeric(4, 2),
	"weight" numeric(5, 2),
	"status" varchar(50) DEFAULT 'Active',
	"suspension_end_date" date,
	"suspension_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(100) NOT NULL,
	"abbreviation" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"championship_id" integer NOT NULL,
	"social_network_id" integer NOT NULL,
	"link" varchar(500) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_networks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "sport_match_rules" (
	"sport_id" integer NOT NULL,
	"match_rules_id" integer NOT NULL,
	CONSTRAINT "sport_match_rules_sport_id_match_rules_id_pk" PRIMARY KEY("sport_id","match_rules_id")
);
--> statement-breakpoint
CREATE TABLE "sport_positions" (
	"sport_id" integer NOT NULL,
	"positions_id" integer NOT NULL,
	CONSTRAINT "sport_positions_sport_id_positions_id_pk" PRIMARY KEY("sport_id","positions_id")
);
--> statement-breakpoint
CREATE TABLE "sport_type_match_events" (
	"sport_id" integer NOT NULL,
	"type_match_event_id" integer NOT NULL,
	CONSTRAINT "sport_type_match_events_sport_id_type_match_event_id_pk" PRIMARY KEY("sport_id","type_match_event_id")
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"id" serial PRIMARY KEY NOT NULL,
	"icon" varchar(500),
	"periods" numeric,
	"match_type_singular" varchar(100),
	"match_type_plural" varchar(100),
	"period_duration" numeric,
	"period_label" varchar(50),
	"period_label_plural" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "team_group_teams" (
	"team_id" integer NOT NULL,
	"group_team_id" integer NOT NULL,
	CONSTRAINT "team_group_teams_team_id_group_team_id_pk" PRIMARY KEY("team_id","group_team_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"championship_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"shortname" varchar(50),
	"slug" varchar(255) NOT NULL,
	"logo_url" varchar(500),
	"document_url" varchar(500),
	"primary_color" varchar(7),
	"secondary_color" varchar(7),
	"founded_year" integer,
	"home_venue" integer,
	"location" varchar(255),
	"is_active" boolean DEFAULT true,
	"has_active_matches" boolean DEFAULT false,
	"coach_name" varchar(255),
	"coach_phone" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "type_match_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"icon" varchar(500),
	"color" varchar(7),
	"match_point" integer DEFAULT 0,
	"category" varchar(50) NOT NULL,
	"standing_points" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email_validated" boolean DEFAULT false NOT NULL,
	"role" integer,
	"img" varchar(500),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "championships" ADD CONSTRAINT "championships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "championships" ADD CONSTRAINT "championships_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_teams" ADD CONSTRAINT "group_teams_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_type_match_event_id_type_match_events_id_fk" FOREIGN KEY ("type_match_event_id") REFERENCES "public"."type_match_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_rules_championship_sports" ADD CONSTRAINT "match_rules_championship_sports_match_rules_id_match_rules_id_fk" FOREIGN KEY ("match_rules_id") REFERENCES "public"."match_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_rules_championship_sports" ADD CONSTRAINT "match_rules_championship_sports_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_rules_championship_sports" ADD CONSTRAINT "match_rules_championship_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_group_team_id_group_teams_id_fk" FOREIGN KEY ("group_team_id") REFERENCES "public"."group_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_groups" ADD CONSTRAINT "phase_groups_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_knockout" ADD CONSTRAINT "phase_knockout_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_league" ADD CONSTRAINT "phase_league_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_swiss" ADD CONSTRAINT "phase_swiss_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phases" ADD CONSTRAINT "phases_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_social_network_id_social_networks_id_fk" FOREIGN KEY ("social_network_id") REFERENCES "public"."social_networks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_match_rules" ADD CONSTRAINT "sport_match_rules_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_match_rules" ADD CONSTRAINT "sport_match_rules_match_rules_id_match_rules_id_fk" FOREIGN KEY ("match_rules_id") REFERENCES "public"."match_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_positions" ADD CONSTRAINT "sport_positions_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_positions" ADD CONSTRAINT "sport_positions_positions_id_positions_id_fk" FOREIGN KEY ("positions_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_type_match_events" ADD CONSTRAINT "sport_type_match_events_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_type_match_events" ADD CONSTRAINT "sport_type_match_events_type_match_event_id_type_match_events_id_fk" FOREIGN KEY ("type_match_event_id") REFERENCES "public"."type_match_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_group_teams" ADD CONSTRAINT "team_group_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_group_teams" ADD CONSTRAINT "team_group_teams_group_team_id_group_teams_id_fk" FOREIGN KEY ("group_team_id") REFERENCES "public"."group_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;