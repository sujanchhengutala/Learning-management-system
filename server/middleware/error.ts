import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"

    //wrong mongodb id 
    if(err.name === "CastError"){
        const message = `Resources not found with this id.. Invalid ${err.path}`
        err = new ErrorHandler(message, 400)
    }
    //Duplicate key error
    if(err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }
    //wrong jwt error

    if(err.name === "jsonWebTokenError") {
        const message = "Json web token is invalid, try again"
        err = new ErrorHandler(message, 400)

    }
    //jwt expired error
    if (err.name === "TokenExpiredError") {
        const message = `Json web token expired. try again`
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

