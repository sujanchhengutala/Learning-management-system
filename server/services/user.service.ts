import { NextFunction, Response } from "express"
import { redis } from "../utils/redis"
import userModel from "../models/userModel"
import ErrorHandler from "../utils/errorHandler"

export const getUserById = async (id: string, res:Response) => {
    const userJson = await redis.get(id)
    if(userJson){
        const user = JSON.parse(userJson)
        res.status(200).json({ success: true, user })
    }
    
}

export const getAllUsersService = async(res:Response)=>{
    const users = await userModel.find().sort({createdAt:-1})
    res.status(200).json({
        success:true,
        users
    })
}

//updateUserRoleService

export const updateUserRoleService = async(res:Response, id:string, role:string)=>{
    const user = await userModel.findByIdAndUpdate(id, {role}, {new:true})
    res.status(200).json({
        succes:true,
        user
    })
}

//delete user

export const deleteUserService = async(res:Response, id:string, next:NextFunction)=>{
const user = await userModel.findById(id)
if(!user){
    return next(new ErrorHandler("User id doesnot exist", 500))
}

await user.deleteOne({id})
await redis.del(id)

res.status(200).json({
    success:true,
    message:"User deleted successfully"

})
}