import mongoose, { Schema, Document } from "mongoose";

export interface ICoach extends Document {
  coach_id: number;
  name: string;
  phone: string;
  email: string;
}

const CoachSchema = new Schema<ICoach>(
  {
    coach_id: {
      type: Number,
      unique: true,
      index: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      maxlength: 12,
    },

    email: {
      type: String,
      required: true,
      maxlength: 20,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const CoachModel = mongoose.model<ICoach>("Coach", CoachSchema);
