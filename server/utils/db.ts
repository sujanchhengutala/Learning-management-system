import mongoose  from "mongoose";
require("dotenv").config()

const connectDB =async () => {
    try {
        const conn = await mongoose.connect(`${process.env.DB_URL}`)
        console.log(conn.connection.host)
        
    } catch (error:any) {
        console.log(error.message)
        setTimeout(connectDB, 5000)
    }
}

export default connectDB