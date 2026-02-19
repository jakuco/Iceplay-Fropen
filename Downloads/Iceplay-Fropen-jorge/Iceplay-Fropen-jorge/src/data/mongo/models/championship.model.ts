import mongoose, { Schema, Document } from "mongoose";

export interface IChampionship extends Document {
  championship_id: number;
  name: string;
  type_id: number;
  format_id: number;
  state_id: number;
  season_id: number;
}

const ChampionshipSchema = new Schema<IChampionship>(
  {
    championship_id: {
      type: Number,
      unique: true,
      index: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      maxlength: 40,
      trim: true,
    },

    type_id: {
      type: Number,
      required: true,
    },

    format_id: {
      type: Number,
      required: true,
    },

    state_id: {
      type: Number,
      required: true,
    },

    season_id: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const ChampionshipModel = mongoose.model<IChampionship>(
  "Championship",
  ChampionshipSchema
);
