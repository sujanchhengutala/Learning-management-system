import { NextFunction, Response } from "express";
import courseModel from "../models/courseModel";

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