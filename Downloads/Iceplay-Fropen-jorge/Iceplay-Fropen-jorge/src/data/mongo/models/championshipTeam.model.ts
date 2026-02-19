import mongoose, { Schema, Document } from "mongoose";

export interface IChampionshipTeam extends Document {
  team_id: number;
  championship_id: number;
  inscription_date: Date;
}

const ChampionshipTeamSchema = new Schema<IChampionshipTeam>(
  {
    team_id: {
      type: Number,
      ref: "Team",
      required: true,
    },

    championship_id: {
      type: Number,
      ref: "Championship",
      required: true,
    },

    inscription_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: false }
);

export const ChampionshipTeamModel = mongoose.model<IChampionshipTeam>(
  "Championship_Team",
  ChampionshipTeamSchema
);
