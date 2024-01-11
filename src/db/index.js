import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`MONGO DB CONNECTION ESTABLISHED -- HOST: ${conn.connection.host}`);
    }catch(error){
        console.log(`MONGODB CONN ERROR:${error}`);
        process.exit(1)
    }
}


export default connectDB