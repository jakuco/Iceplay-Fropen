import mongoose from "mongoose";

// ── SocialNetwork ─────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
const SocialNetworkSchema = new mongoose.Schema({
    id:   { type: Number, required: true, unique: true },
    name: { type: String, required: [true, "Name is required"], unique: true },
    icon: { type: String },
});

export const SocialNetworkModel = mongoose.model("SocialNetwork", SocialNetworkSchema);


// ── Championship ──────────────────────────────────────────────────────────────
// id: autoincrement (no viene en JSON)
// organizationId: FK → Organization.id  |  sportId: FK → Sport.id
const ChampionshipSchema = new mongoose.Schema({
    id:                    { type: Number, required: true, unique: true },
    organizationId:        { type: Number, required: [true, "Organization is required"] },
    sportId:               { type: Number, required: [true, "Sport is required"] },
    name:                  { type: String, required: [true, "Name is required"] },
    slug:                  { type: String, required: [true, "Slug is required"], unique: true },
    description:           { type: String },
    season:                { type: String, required: [true, "Season is required"] },
    logo:                  { type: String },
    status:                { type: Number, default: 1 },
    registrationStartDate: { type: Date },
    registrationEndDate:   { type: Date },
    startDate:             { type: Date },
    endDate:               { type: Date },
    maxTeams:              { type: Number },
    maxPlayersPerTeam:     { type: Number },
}, { timestamps: true });

export const ChampionshipModel = mongoose.model("Championship", ChampionshipSchema);


// ── SocialLinks ───────────────────────────────────────────────────────────────
// id: autoincrement  |  championshipId: FK → Championship.id
// socialNetworkId: FK → SocialNetwork.id
const SocialLinksSchema = new mongoose.Schema({
    id:              { type: Number, required: true, unique: true },
    championshipId:  { type: Number, required: [true, "Championship is required"] },
    socialNetworkId: { type: Number, required: [true, "SocialNetwork is required"] },
    link:            { type: String, required: [true, "Link is required"] },
});

SocialLinksSchema.index({ championshipId: 1, socialNetworkId: 1 }, { unique: true });

export const SocialLinksModel = mongoose.model("SocialLinks", SocialLinksSchema);


// ── MatchRulesChampionshipSport (pivot con valor sobreescrito) ────────────────
// matchRulesId: FK → MatchRules.id  |  championshipId: FK → Championship.id
// sportId: FK → Sport.id
const MatchRulesChampionshipSportSchema = new mongoose.Schema({
    matchRulesId:   { type: Number, required: [true, "MatchRules is required"] },
    championshipId: { type: Number, required: [true, "Championship is required"] },
    sportId:        { type: Number, required: [true, "Sport is required"] },
    value:          { type: Number, required: [true, "Value is required"] },
});

MatchRulesChampionshipSportSchema.index({ matchRulesId: 1, championshipId: 1, sportId: 1 }, { unique: true });

export const MatchRulesChampionshipSportModel = mongoose.model("MatchRulesChampionshipSport", MatchRulesChampionshipSportSchema);
