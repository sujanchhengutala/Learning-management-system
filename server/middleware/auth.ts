import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import  jwt, { JwtPayload }  from "jsonwebtoken";
import { redis } from "../utils/redis";

//authenticate user
export const isAuthenticate =async (req:Request|any, res:Response, next:NextFunction) => {

    // const access_token = req.headers.authorization

    const access_token = req.cookies.access_token as string
    

    if(!access_token){
        return next(new ErrorHandler("please login to access this resources", 400))
    }

    const decode = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload

    if(!decode){
        return next(new ErrorHandler("access token is not valid", 400))
    }
    const user = await redis.get(decode.id)
    if(!user){
        return next(new ErrorHandler("user not found", 400)) 
    }

   req.user = JSON.parse(user)

    next()
}

//validate user role

export const authorizeRoles = (...roles:string[])=>{
    return (req:Request|any, res:Response, next:NextFunction)=>{
        if(!roles.includes(req.user?.role || "")){
            return next(new ErrorHandler(`Roles ${req.user?.role} is not allowed to access this resources`, 400))
        }
        next()
    }

}