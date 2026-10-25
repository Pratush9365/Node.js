import { User } from "../schema/user.schema.js";
class UserRepository {
    async setUser(user) {
        const { age, name } = user;
        const dataToSave = {
            name: name
        };
        if (age) {
            dataToSave.age = age;
        }
        await User.insertOne(dataToSave);
    }
    async getUser() {
        const data = await User.find();
        return data;
    }
}
export const userRepo = new UserRepository;
//# sourceMappingURL=user.repository.js.map