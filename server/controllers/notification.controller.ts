import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/errorHandler"
import NotificationModel from "../models/notificationModel"
import cron from "node-cron"

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
//npde-cron
//The node-cron module is tiny task scheduler in pure JavaScript for node.js based on GNU crontab. This module allows you to schedule task in node.js using full crontab syntax.

cron.schedule( "0 0 * * *",async()=>{
    const thirtyDayAgo = new Date(Date.now()-30*24*60*60*1000)
    await NotificationModel.deleteMany({status:"read", createdAt:{$lt:thirtyDayAgo}}) //$lt=less than

})