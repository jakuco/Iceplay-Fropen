import mongoose from "mongoose";

// ── Match ─────────────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
// groupTeamId: FK → GroupTeam.id  |  homeTeamId/awayTeamId: FK → Team.id
const MatchSchema = new mongoose.Schema({
    id:              { type: Number, required: true, unique: true },
    groupTeamId:     { type: Number, required: [true, "GroupTeam is required"] },
    homeTeamId:      { type: Number, required: [true, "Home team is required"] },
    awayTeamId:      { type: Number, required: [true, "Away team is required"] },
    homeScore:       { type: Number, default: 0 },
    awayScore:       { type: Number, default: 0 },
    status:          { type: String, enum: ["pending", "active", "finished"], default: "pending" },
    round:           { type: Number },
    matchday:        { type: Number },
    scheduledDate:   { type: Date },
    scheduledTime:   { type: String },
    actualStartTime: { type: Date },
    actualEndTime:   { type: Date },
    venue:           { type: String },
    city:            { type: String },
}, { timestamps: true });

export const MatchModel = mongoose.model("Match", MatchSchema);


// ── MatchPlayer (pivot) ───────────────────────────────────────────────────────
// matchId: FK → Match.id  |  playerId: FK → Player.id (viene del JSON)
const MatchPlayerSchema = new mongoose.Schema({
    matchId:  { type: Number, required: [true, "Match is required"] },
    playerId: { type: Number, required: [true, "Player is required"] },
});

MatchPlayerSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

export const MatchPlayerModel = mongoose.model("MatchPlayer", MatchPlayerSchema);


// ── MatchEvent ────────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
// matchId: FK → Match.id
// typeMatchEventId: FK → TypeMatchEvent.id (viene del JSON)
// playerId: FK → Player.id (viene del JSON, nullable)
// teamId: FK → Team.id (viene del JSON, nullable)
const MatchEventSchema = new mongoose.Schema({
    id:               { type: Number, required: true, unique: true },
    matchId:          { type: Number, required: [true, "Match is required"] },
    typeMatchEventId: { type: Number, required: [true, "TypeMatchEvent is required"] },
    playerId:         { type: Number, default: null },
    teamId:           { type: Number, default: null },
    time:             { type: Number, required: [true, "Time is required"] },
});

export const MatchEventModel = mongoose.model("MatchEvent", MatchEventSchema);
