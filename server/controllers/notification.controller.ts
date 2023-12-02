import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/errorHandler"
import NotificationModel from "../models/notificationModel"

//get all notification - only for admin
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

export const updateNotification = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const notificationId = req.params.id
        const notification  = await NotificationModel.findById(notificationId)
        if(!notification){
            return next(new ErrorHandler("Notification not found", 500))
        }
        else{
            notification.status ? notification.status = "read" : notification?.status
        }
        await notification.save()

        const notifications = await NotificationModel.find().sort({createdAt:-1})
        res.status(200).json({success:true, notifications})
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
        
    }
}

//delete notification

export const deleteNotification = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
}