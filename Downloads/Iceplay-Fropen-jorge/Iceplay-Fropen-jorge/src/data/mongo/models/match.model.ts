import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  match_id: number;
  championship_id: number;
  home_team_id: number;
  away_team_id: number;
  date: Date;
  state: number;
  match_events: any;
}

const MatchSchema = new Schema<IMatch>(
  {
    match_id: {
      type: Number,
      unique: true,
      index: true,
      required: true,
    },

    championship_id: {
      type: Number,
      ref: "Championship",
      required: true,
    },

    home_team_id: {
      type: Number,
      ref: "Team",
      required: true,
    },

    away_team_id: {
      type: Number,
      ref: "Team",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    state: {
      type: Number,
      required: true,
    },

    match_events: {
      type: Schema.Types.Mixed, // json{Evento[entrar, salir, roja, amarilla, gol, asistencia], id_jugador, minuto}
      required: false,
    },
  },
  { timestamps: true }
);

export const MatchModel = mongoose.model<IMatch>("Match", MatchSchema);
