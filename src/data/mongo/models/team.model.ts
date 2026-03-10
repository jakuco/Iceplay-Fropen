import mongoose from "mongoose";

// ── Team ──────────────────────────────────────────────────────────────────────
// id: viene del JSON (1–16)
// championshipId: FK → Championship.id
const TeamSchema = new mongoose.Schema({
    id:               { type: Number, required: true, unique: true },
    championshipId:   { type: Number, required: [true, "Championship is required"] },
    name:             { type: String, required: [true, "Name is required"] },
    shortname:        { type: String, required: [true, "Shortname is required"] },
    slug:             { type: String, required: [true, "Slug is required"] },
    logoUrl:          { type: String },
    primaryColor:     { type: String },
    secondaryColor:   { type: String },
    foundedYear:      { type: Number },
    homeVenue:        { type: String },
    location:         { type: String },
    isActive:         { type: Boolean, default: true },
    hasActiveMatches: { type: Boolean, default: false },
    coachName:        { type: String },
    coachPhone:       { type: String },
}, { timestamps: true });

export const TeamModel = mongoose.model("Team", TeamSchema);


// ── Player ────────────────────────────────────────────────────────────────────
// id: viene del JSON (1–128)
// teamId: FK → Team.id  |  positionId: FK → Position.id
const PlayerSchema = new mongoose.Schema({
    id:                { type: Number, required: true, unique: true },
    teamId:            { type: Number, required: [true, "Team is required"] },
    positionId:        { type: Number, required: [true, "Position is required"] },
    firstName:         { type: String, required: [true, "First name is required"] },
    lastName:          { type: String, required: [true, "Last name is required"] },
    nickName:          { type: String },
    number:            { type: Number },
    documentURL:       { type: String },
    birthDate:         { type: Date },
    height:            { type: Number },
    weight:            { type: Number },
    status:            { type: String, enum: ["Active", "Suspended", "Injured"], default: "Active" },
    suspensionEndDate: { type: Date, default: null },
    suspensionReason:  { type: String, default: null },
}, { timestamps: true });

export const PlayerModel = mongoose.model("Player", PlayerSchema);


// ── GroupTeam ─────────────────────────────────────────────────────────────────
// id: viene del JSON
// phaseId: FK → Phase.id
const GroupTeamSchema = new mongoose.Schema({
    id:      { type: Number, required: true, unique: true },
    phaseId: { type: Number, required: [true, "Phase is required"] },
    order:   { type: Number, required: [true, "Order is required"] },
});

export const GroupTeamModel = mongoose.model("GroupTeam", GroupTeamSchema);


// ── TeamGroupTeam (pivot) ─────────────────────────────────────────────────────
// teamId: FK → Team.id  |  groupTeamId: FK → GroupTeam.id
const TeamGroupTeamSchema = new mongoose.Schema({
    teamId:      { type: Number, required: [true, "Team is required"] },
    groupTeamId: { type: Number, required: [true, "GroupTeam is required"] },
});

TeamGroupTeamSchema.index({ teamId: 1, groupTeamId: 1 }, { unique: true });

export const TeamGroupTeamModel = mongoose.model("TeamGroupTeam", TeamGroupTeamSchema);
