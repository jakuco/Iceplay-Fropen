import mongoose from "mongoose";
import { UserModel } from "./models/user.model";


interface Options {
    mongoUrl: string;
    dbName: string;
} 


export class MongoDatabase {
    static async connect(options: Options) {
        const { mongoUrl, dbName } = options;

        try{
            await  mongoose.connect(mongoUrl, { dbName });
            console.log("Connect to Mongo");
            
            // Drop the unique index on emailValidated if it exists (legacy cleanup)
            // try {
            //     await UserModel.collection.dropIndex('emailValidated_1');
            //     console.log("Dropped unique index on emailValidated");
            // } catch (error: any) {
            //     // Index doesn't exist or already dropped, ignore error
            //     if (error.codeName !== 'IndexNotFound') {
            //         console.log("Note: Could not drop emailValidated index (may not exist)");
            //     }
            // }
            
            return true;
        }catch(error){
            console.log("Mongo conecction error");
        }   
    }
}
