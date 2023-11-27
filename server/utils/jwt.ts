import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { IUser } from "../models/userModel";
import { redis } from "./redis";

 require("dotenv").config()
  
 interface ITokenOption{
    expires:Date;
    maxAge:number;
    httpOnly:boolean;
    sameSite:"lax" | "strict" | "none" | undefined;
    secure?:boolean
 }
//parse environment variable to integrate with fallback values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)

//OPTION FOR COOKIES
export const accessTokenOption:ITokenOption={
   expires:new Date(Date.now()+accessTokenExpire * 60 * 60 * 1000),
   maxAge:accessTokenExpire*60*60*1000,
   httpOnly:true,
   sameSite:'lax',
   secure:true
};
export const refreshTokenOption:ITokenOption={
   expires:new Date(Date.now()+refreshTokenExpire*24*60*60*1000),
   maxAge:accessTokenExpire * 24 * 60 * 60 * 1000,
   httpOnly:true,
   sameSite:'lax'
};

 export const SendToken = (user:IUser, statusCode:number, res:Response)=>{
const accessToken = user.signAccessToken()
const refreshToken = user.signRefreshToken();

//upload session of user while login to redis
redis.set(user._id, JSON.stringify(user) as any)

//only set secure to true in production
if(process.env.NODE_ENV ==='production'){
   accessTokenOption.secure=true
}
res.cookie("access_token", accessToken, accessTokenOption)
res.cookie("refresh_token", refreshToken, refreshTokenOption)
res.status(statusCode).json({
   success:true,
   user, accessToken
})

 } 