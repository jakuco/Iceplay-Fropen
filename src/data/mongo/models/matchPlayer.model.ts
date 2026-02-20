import mongoose, { Schema, Document } from "mongoose";

export interface IMatchPlayer extends Document {
  player_id: number;
  match_id: number;
  score: number;
}

const MatchPlayerSchema = new Schema<IMatchPlayer>(
  {
    player_id: {
      type: Number,
      ref: "Player",
      required: true,
    },

    match_id: {
      type: Number,
      ref: "Match",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      default: 0
    },
  },
  { timestamps: false }
);

export const MatchPlayerModel = mongoose.model<IMatchPlayer>(
  "Match_Player",
  MatchPlayerSchema
);
