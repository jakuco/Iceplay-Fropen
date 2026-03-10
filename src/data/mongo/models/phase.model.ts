import mongoose from "mongoose";

// ── Phase ─────────────────────────────────────────────────────────────────────
// id: viene del JSON (1, 2, ...)
// championshipId: FK → Championship.id
const PhaseSchema = new mongoose.Schema({
    id:             { type: Number, required: true, unique: true },
    championshipId: { type: Number, required: [true, "Championship is required"] },
    name:           { type: String, required: [true, "Name is required"] },
    phaseType:      { type: String, required: [true, "Phase type is required"], enum: ["swiss", "knockout", "league", "groups"] },
    phaseOrder:     { type: Number, required: [true, "Phase order is required"] },
    status:         { type: String, required: [true, "Status is required"], enum: ["pending", "active", "finished"], default: "pending" },
}, { timestamps: true });

export const PhaseModel = mongoose.model("Phase", PhaseSchema);


// ── PhaseSuizo ────────────────────────────────────────────────────────────────
// id: autoincrement  |  phaseId: FK → Phase.id (único, relación 1-1)
const PhaseSuizoSchema = new mongoose.Schema({
    id:                  { type: Number, required: true, unique: true },
    phaseId:             { type: Number, required: [true, "Phase is required"], unique: true },
    numRounds:           { type: Number, required: [true, "Num rounds is required"] },
    pairingSystem:       { type: String, required: [true, "Pairing system is required"] },
    firstRound:          { type: String },
    allowRematch:        { type: Boolean, default: false },
    tiebreakOrder:       { type: String },
    directAdvancedCount: { type: Number, default: 0 },
    playoffCount:        { type: Number, default: 0 },
});

export const PhaseSuizoModel = mongoose.model("PhaseSuizo", PhaseSuizoSchema);


// ── PhaseKnockout ─────────────────────────────────────────────────────────────
// id: autoincrement  |  phaseId: FK → Phase.id (único, relación 1-1)
const PhaseKnockoutSchema = new mongoose.Schema({
    id:              { type: Number, required: true, unique: true },
    phaseId:         { type: Number, required: [true, "Phase is required"], unique: true },
    legs:            { type: Number, default: 1 },
    fixtureMode:     { type: String },
    seeding:         { type: String },
    byeStrategy:     { type: String },
    tieBreak:        { type: String },
    awayGoalsRule:   { type: Boolean, default: false },
    thirdPlaceMatch: { type: Boolean, default: false },
});

export const PhaseKnockoutModel = mongoose.model("PhaseKnockout", PhaseKnockoutSchema);


// ── PhaseLiga ─────────────────────────────────────────────────────────────────
// id: autoincrement  |  phaseId: FK → Phase.id (único, relación 1-1)
const PhaseLigaSchema = new mongoose.Schema({
    id:            { type: Number, required: true, unique: true },
    phaseId:       { type: Number, required: [true, "Phase is required"], unique: true },
    legs:          { type: Number, default: 1 },
    tiebreakOrder: { type: String },
    advanceCount:  { type: Number, default: 0 },
});

export const PhaseLigaModel = mongoose.model("PhaseLiga", PhaseLigaSchema);


// ── PhaseGrupos ───────────────────────────────────────────────────────────────
// id: autoincrement  |  phaseId: FK → Phase.id (único, relación 1-1)
const PhaseGruposSchema = new mongoose.Schema({
    id:                { type: Number, required: true, unique: true },
    phaseId:           { type: Number, required: [true, "Phase is required"], unique: true },
    numGroups:         { type: Number, required: [true, "Num groups is required"] },
    teamsPerGroup:     { type: Number, required: [true, "Teams per group is required"] },
    assignment:        { type: String },
    legs:              { type: Number, default: 1 },
    advancePerGroup:   { type: Number, default: 0 },
    advanceBestThirds: { type: Number, default: 0 },
    tiebreakOrder:     { type: String },
});

export const PhaseGruposModel = mongoose.model("PhaseGrupos", PhaseGruposSchema);
