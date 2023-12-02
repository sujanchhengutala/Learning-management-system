import { NextFunction, Response } from "express";
import OrderModel from "../models/orderModel";

export const newOrder = async(data:any,res:Response, next:NextFunction)=>{
        const order = await OrderModel.create(data)
        res.status(201).json({success:true, order})

}

export const getAllOrdersService = async(res:Response)=>{
        const orders = await OrderModel.find().sort({createdAt:-1})
        res.status(200).json({
            success:true,
            orders
        })
    }