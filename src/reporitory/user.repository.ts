import type { IUserPayload } from "../module/user/interface/user.interface.js";
import { User } from "../schema/user.schema.js";

class UserRepository {
    async setUser(user: IUserPayload) {
        const {age, name} = user;
        const dataToSave: IUserPayload = {
            name: name
        }
        if(age) {
            dataToSave.age = age;
        }
         await User.insertOne(dataToSave);
    }

    async getUser() {
        const data = await User.find();
        return data;
    }
}
export const userRepo = new UserRepository
