import type { IUserPayload } from "../module/user/interface/user.interface.js";
declare class UserRepository {
    setUser(user: IUserPayload): Promise<void>;
    getUser(): Promise<(import("mongoose").Document<unknown, {}, import("../schema/user.schema.js").IUserSchema, {}, import("mongoose").DefaultSchemaOptions> & import("../schema/user.schema.js").IUserSchema & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
export declare const userRepo: UserRepository;
export {};
//# sourceMappingURL=user.repository.d.ts.map