import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
  team_id: number;
  name: string;
  shortname: string;
  city: string;
}

const TeamSchema = new Schema<ITeam>(
  {
    team_id: {
      type: Number,
      unique: true,
      index: true,
      required: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      maxlength: 20,
      trim: true,
    },

    shortname: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
  },
  { timestamps: true }
);

export const TeamModel = mongoose.model<ITeam>("Team", TeamSchema);
