import mongoose from "mongoose";

// ── Position ──────────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
const PositionSchema = new mongoose.Schema({
    id:           { type: Number, required: true, unique: true },
    code:         { type: String, required: [true, "Code is required"], unique: true },
    label:        { type: String, required: [true, "Label is required"] },
    abbreviation: { type: String, required: [true, "Abbreviation is required"] },
});

export const PositionModel = mongoose.model("Position", PositionSchema);


// ── TypeMatchEvent ────────────────────────────────────────────────────────────
// id: viene del JSON (1–13)
const TypeMatchEventSchema = new mongoose.Schema({
    id:             { type: Number, required: true, unique: true },
    label:          { type: String, required: [true, "Label is required"] },
    icon:           { type: String },
    color:          { type: String },
    matchPoint:     { type: Number, default: 0 },
    category:       { type: String, required: [true, "Category is required"], enum: ["score", "discipline", "substitution", "match_control", "match_result"] },
    standingPoints: { type: Number, default: 0 },
});

export const TypeMatchEventModel = mongoose.model("TypeMatchEvent", TypeMatchEventSchema);


// ── MatchRules ────────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
const MatchRulesSchema = new mongoose.Schema({
    id:    { type: Number, required: true, unique: true },
    name:  { type: String, required: [true, "Rule name is required"] },
    value: { type: Number, required: [true, "Default value is required"] },
});

export const MatchRulesModel = mongoose.model("MatchRules", MatchRulesSchema);


// ── Sport ─────────────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
const SportSchema = new mongoose.Schema({
    id:                { type: Number, required: true, unique: true },
    icon:              { type: String },
    periods:           { type: Number, required: [true, "Periods is required"] },
    matchTypeSingular: { type: String, required: [true, "Match type singular is required"] },
    matchTypePlural:   { type: String, required: [true, "Match type plural is required"] },
    periodDuration:    { type: Number, required: [true, "Period duration is required"] },
    periodLabel:       { type: String, required: [true, "Period label is required"] },
    periodLabelPlural: { type: String, required: [true, "Period label plural is required"] },
}, { timestamps: true });

export const SportModel = mongoose.model("Sport", SportSchema);


// ── SportPosition (pivot) ─────────────────────────────────────────────────────
// sportId: FK → Sport.id  |  positionId: FK → Position.id
const SportPositionSchema = new mongoose.Schema({
    sportId:    { type: Number, required: [true, "Sport is required"] },
    positionId: { type: Number, required: [true, "Position is required"] },
});

SportPositionSchema.index({ sportId: 1, positionId: 1 }, { unique: true });

export const SportPositionModel = mongoose.model("SportPosition", SportPositionSchema);


// ── SportTypeMatchEvent (pivot) ───────────────────────────────────────────────
// sportId: FK → Sport.id  |  typeMatchEventId: FK → TypeMatchEvent.id
const SportTypeMatchEventSchema = new mongoose.Schema({
    sportId:          { type: Number, required: [true, "Sport is required"] },
    typeMatchEventId: { type: Number, required: [true, "TypeMatchEvent is required"] },
});

SportTypeMatchEventSchema.index({ sportId: 1, typeMatchEventId: 1 }, { unique: true });

export const SportTypeMatchEventModel = mongoose.model("SportTypeMatchEvent", SportTypeMatchEventSchema);


// ── SportMatchRules (pivot) ───────────────────────────────────────────────────
// sportId: FK → Sport.id  |  matchRulesId: FK → MatchRules.id
const SportMatchRulesSchema = new mongoose.Schema({
    sportId:      { type: Number, required: [true, "Sport is required"] },
    matchRulesId: { type: Number, required: [true, "MatchRules is required"] },
});

SportMatchRulesSchema.index({ sportId: 1, matchRulesId: 1 }, { unique: true });

export const SportMatchRulesModel = mongoose.model("SportMatchRules", SportMatchRulesSchema);
