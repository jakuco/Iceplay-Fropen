import mongoose, { Schema } from "mongoose";

const CategorySchema = new mongoose.Schema({
    
    name: { type: String, required:[ true, "Name is required"], uniqueL: true },
    available: { type: Boolean, default: false },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }
});

export const CategoryModel = mongoose.model('Category', CategorySchema);
