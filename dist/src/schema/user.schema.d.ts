import mongoose, { type Document } from "mongoose";
export interface IUserSchema extends Document {
    name: string;
    age?: number;
}
export declare const User: mongoose.Model<IUserSchema, {}, {}, {}, Document<unknown, {}, IUserSchema, {}, mongoose.DefaultSchemaOptions> & IUserSchema & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserSchema & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=user.schema.d.ts.map