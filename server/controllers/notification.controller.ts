import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/errorHandler"
import NotificationModel from "../models/notificationModel"

export const getNotification = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const notification = await NotificationModel.find().sort({createadAt:-1})
        res.status(201).json({
            success:true,
            notification
        })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
}