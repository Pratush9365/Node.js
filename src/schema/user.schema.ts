import mongoose, { Schema, type Document } from "mongoose";

export interface IUserSchema extends Document {
    name: string;
    age?: number; 
}

const UserSchema = new Schema<IUserSchema>({
    name: {
        type: String,
        trim: true,
    },
    age: {
        type: Number,
        required: false,
    }
})

export const User = mongoose.model<IUserSchema>('user', UserSchema);