import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import { IOrder } from "../models/orderModel";
import userModel from "../models/userModel";
import courseModel from "../models/courseModel";
import { getAllOrdersService, newOrder } from "../services/order.service";
import path from "path";
import ejs from "ejs"
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";



export const createOrder = async(req:Request|any, res:Response, next:NextFunction)=>{
    try {
        
        const {courseId, payment_info}= req.body as IOrder
        const userId = req.user?._id
        const user = await userModel.findById(userId)
        const courseExistInUser = user?.cources.find((course:any)=>course._id.toString()===courseId)
        if(courseExistInUser){
            return next(new ErrorHandler("You have already purchase this course", 404))
        }
        const course = await courseModel.findById(courseId)
        if(!course){
            return next(new ErrorHandler("course not found", 404))
        }
        const data = {
            courseId:course._id,
            userId, 
            payment_info
        }
        const mailData = {
            order:{
                _id:course._id.toString().slice(0, 6),
                name:course.name,
                price:course.price,
                date:new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric' })

            }
        }
        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), {order:mailData})
            try {
                if(user){
                    await sendMail({
                        email: user.email,
                        subject:"order Confirmation",
                        template:"order-confirmation.ejs",
                        data:mailData
                    })
                }
                user?.cources.push(course?._id)
                await user?.save()

                await NotificationModel.create({
                    user:userId,
                    title:"New Order",
                    message:`you have new order from ${course.name}`
                })
                
            } catch (error:any) {
                return next(new ErrorHandler(error.message, 400))
                
            }
            course.purchased ? course.purchased +=1 :course.purchased
            
            await course.save()
        newOrder(data, res, next)

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
}

//GET All orders- only for admin

export const getAllOrders = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        getAllOrdersService(res)
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
}