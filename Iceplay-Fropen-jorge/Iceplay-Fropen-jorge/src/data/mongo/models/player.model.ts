import mongoose, { Schema } from "mongoose";

const PlayerSchema = new mongoose.Schema({
  player_id: {
    type: Number,
    unique: true,
    index: true
  },

  number: {
    type: Number,
    required: true
  },

  name: {
    type: String,
    required: [true, "Name is required"],
    maxlength: 30,
    trim: true
  },

  lastname: {
    type: String,
    required: [true, "Lastname is required"],
    maxlength: 30,
    trim: true
  },

  weight: {
    type: Number,
    required: true
  },

  height: {
    type: Number,
    required: true
  },

  primary_position: {
    type: Number,
    required: true
  },

  secondary_position: {
    type: Number,
    required: false
  },

  home_country: {
    type: String,
    required: true,
    maxlength: 20
  },

  state_id: {
    type: Number,
    required: true
  },

  type: {
    type: Number,
    required: true
  },

  team_id: {
    //type: Schema.Types.ObjectId, // no se si se pueda obtener el id del objeto
    type: Number,
    ref: "Team",
    required: true
  },
  player_statics: {
    type: Schema.Types.Mixed, // json{partidos_jugados, goles, asistencias, tarjetas_amarillas, tarjetas_rojas}
    required: false,
  },


}, {
  timestamps: false  // Se podría cambiar
});

export const PlayerModel = mongoose.model("Player", PlayerSchema);
