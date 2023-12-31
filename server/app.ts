import express, { NextFunction, Request, Response } from "express"
import router from "./routes/user.routes"
import courseRouter from "./routes/course.routes"
import dotenv from "dotenv"
export const app = express()
import cors from "cors"
import cookieParser from "cookie-parser"
import { ErrorMiddleware } from "./middleware/error"
import ejs from "ejs"
import oredrRouter from "./routes/order.routes"
import notificationRoute from "./routes/notification.routes"

dotenv.config()

//BODY PARSER
app.use(express.json({limit:"50mb"}))

//cookie-parser
app.use(cookieParser())

//cors
app.use(cors({
    origin:process.env.ORIGIN
}))

//routes

app.use("/api/v1",router, courseRouter, oredrRouter, notificationRoute)






//testing api
app.get("/test", (req:Request, res:Response, next:NextFunction)=>{
res.status(200).json({
    success:true,
    message:"Api is working"
})
})

//for unknown route
app.all("*",(req:Request, res:Response, next:NextFunction)=>{
    const err:any = new Error(`Route ${req.originalUrl} is not found`) 
    err.statusCode = 404,
    next(err)

})
 
app.use(ErrorMiddleware)