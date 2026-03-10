import mongoose from "mongoose";

// id: autoincrement (no viene en JSON)
const OrganizationSchema = new mongoose.Schema({
    id:             { type: Number, required: true, unique: true },
    name:           { type: String, required: [true, "Name is required"] },
    slug:           { type: String, required: [true, "Slug is required"], unique: true },
    description:    { type: String },
    logo:           { type: String },
    contactEmail:   { type: String, required: [true, "Contact email is required"] },
    contactPhone:   { type: String },
    city:           { type: String },
    country:        { type: String },
    primaryColor:   { type: String },
    secondaryColor: { type: String },
}, { timestamps: true });

export const OrganizationModel = mongoose.model("Organization", OrganizationSchema);
