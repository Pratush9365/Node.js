import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    age: {
        type: Number,
        required: false,
    }
});
export const User = mongoose.model('user', UserSchema);
//# sourceMappingURL=user.schema.js.map