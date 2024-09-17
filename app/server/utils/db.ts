import mongoose from "mongoose";
import { database_default_url } from "../config/db.config";
require("dotenv").config();


const connectDB = async () => {
    try {
        await mongoose.connect(database_default_url()).then((data: any) => {
            console.log(`Database connected with ${data.connection.host}`)
        })
    } catch (error: any) {
        console.log(error.message)
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;