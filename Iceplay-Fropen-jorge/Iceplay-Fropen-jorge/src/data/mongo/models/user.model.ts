import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    
    name: { type: String, required:[ true, "Name is required"] },
    email: { type: String, required: [  true, "Email is required"], unique: true },
    emailValidated: { type: Boolean, required: [ true, "Email validation status is required"], default: false },
    password: { type: String, required: [ true, "Password is required"] },
    img: { type: String },
    role: { type: [String], enum: ['ADMIN_ROLE', 'USER_ROLE'], default: 'USER_ROLE' },
});

// Ensure emailValidated is NOT unique (explicitly define as non-unique index)
UserSchema.index({ emailValidated: 1 }, { unique: false });

export const UserModel = mongoose.model('User', UserSchema);
