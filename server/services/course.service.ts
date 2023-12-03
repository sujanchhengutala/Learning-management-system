import { NextFunction, Response } from "express";
import courseModel from "../models/courseModel";
import ErrorHandler from "../utils/errorHandler";
import { redis } from "../utils/redis";

//create course
export const createCourse = async(data:any, res:Response, next:NextFunction)=>{
    const course = await courseModel.create(data)
    res.status(201).json({
        success:true,
        course
    })
}
export const getAllCourcesService = async(res:Response)=>{
    const cources = await courseModel.find().sort({createdAt:-1})
    res.status(200).json({
        success:true,
        cources
    })
}

export const deleteCourseService = async(res:Response, id:string, next:NextFunction)=>{
    const course = await courseModel.findById(id)
    if(!course){
        return next(new ErrorHandler("course id doesnot exist", 500))
    }
    
    await course.deleteOne({id})
    await redis.del(id)
    
    res.status(200).json({
        success:true,
        message:"Course deleted successfully"
    
    })
    }