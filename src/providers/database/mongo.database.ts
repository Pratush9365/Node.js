import mongoose from "mongoose";

export class MongoDatabase {
    public static async initConn() {
        await mongoose.connect('mongodb+srv://pratushpandey_db_user:nWyo6eg7RQZyW1Y0@cluster0.m11oua4.mongodb.net/');
        console.log('DB connection initialize')
    }
}