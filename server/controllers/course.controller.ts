import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import cloudinary from "cloudinary"
import { createCourse } from "../services/course.service";
import courseModel from "../models/courseModel";
import { redis } from "../utils/redis";
import ejs from "ejs"
import mongoose from "mongoose";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";


export const uploadCourse = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const data = req.body
        const thumbnail = data.thumbnail
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next)

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
}

export const editCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const courseId = req.params.id
        const thumbnail = data.thumbnail
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id)

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            })
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }

        const course = await courseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true })
        res.status(201).json({
            success: true, course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
}

export const getSingleCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id
        //searching cash from redis to make searching faster
        const isCacheExist = await redis.get(courseId)

        if (isCacheExist) {
            const course = await JSON.parse(isCacheExist)

            res.status(200).json({ success: true, course })
        }
        else {
            const course = await courseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links")
            //first time it search from mongo and then it search from cache from redis
            // console.log("hitting mongoo")
            await redis.set(courseId, JSON.stringify(course))
            res.status(200).json({
                success: true,
                course
            })
        }


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))

    }
}

export const getAllCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("getAllCourse")
        if (isCacheExist) {
            console.log("redis hit")
            const courses = await JSON.parse(isCacheExist)
            res.status(200).json({ success: true, courses })
        }
        else {
            const courses = await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links")
            console.log("redis hit")
            await redis.set("getAllCourse", JSON.stringify(courses))
            res.status(200).json({
                success: true,
                courses
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))

    }
}

//get course content--only for valid user
export const getCourseByUser = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.cources
        const courseId = req.params.id
        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId)
        if (!courseExist) {
            return next(new ErrorHandler("You are not eligible to access this course", 400))
        }
        const course = await courseModel.findById(courseId)
        const content = course?.courseData
        res.status(200).send({ success: true, content })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }

}


//add question in course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQestion = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        console.log(user, "hello i am user")
        const { question, courseId, contentId }: IAddQuestionData = req.body
        const course = await courseModel.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content id", 400))
        }
        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId)
        )

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content Id", 400))
        }

        //create a new question object

        const newQuestion: any = {
            user,
            question,
            questionReplies: []
        }
        courseContent.question.push(newQuestion)
        await NotificationModel.create({
            user:user._id,
            title:"New Qu8estion",
            message:`you have new order from ${courseContent?.title}`
        })
        await course?.save()
        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
}


//add answering question
interface IAddAnswerData {
    answer: string;
    contentId: string;
    courseId: string;
    questionId: string;
}

export const addAnswer = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { answer, contentId, courseId, questionId } = req.body
        const course = await courseModel.findById(courseId)
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content id", 400))
        }
        const courseContent = course?.courseData.find((item: any) => item._id.equals(contentId)
        )

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content Id", 400))
        }
        console.log("correct")
        const question = courseContent?.question.find((item: any) => item._id.equals(questionId))
        if (!question) {
            console.log("correct1")

            return next(new ErrorHandler("Invalid content Id", 400))

        }
        const newAnswer: any = {
            user,
            answer
        }
        question.questionReplies?.push(newAnswer)
        console.log(question.user._id)
        await course?.save()
        const userId = req.user?._id
        //the person who asked question can't replies their answer so we perform validation
        if (userId === question.user._id) {
            //send a notification
            await NotificationModel.create({
                user:user._id,
                title:"New Qu8estion reply added",
                message:`you have new order from ${courseContent?.title}`
            })

        }

        else {
            const data = {
                name: question.user.name,
                title: courseContent.title
            }
            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data)
            try {
                await sendMail({
                    email: question.user?.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data
                })
            } catch (error: any) {
                console.log("mistake is here")
                return next(new ErrorHandler(error.message, 400))
            }
        }
        res.status(200).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
}

//add review in course
interface IAddReviewData{
    review:string;
    userId:string;
    rating:string;
    courseId:string;
}

export const addReview = async(req:Request|any, res:Response, next:NextFunction)=>{
    try {
        const courseId=req.params.id
        const user = req.user
        const userCourseList = user.cources
        const isCourseExist = userCourseList.some((course:any)=>course._id.toString() === courseId.toString())
        //.some(): This is an array method in JavaScript. It checks if at least one element in the array satisfies a provided condition. It takes a callback function as an argument.

        if(!isCourseExist){
            return next(new ErrorHandler("You are not eligible to access this course", 500))
        }

        const course = await courseModel.findById(courseId)
        const {review, rating}=req.body as IAddReviewData
        const reviewData:any={
            comment:review,
            rating,
            user
        }
        await course?.reviews.push(reviewData)

        let avg = 0
        course?.reviews.forEach((rev:any)=>{
            avg = avg + rev.rating
        })
        if(course){
            course.ratings = avg / course.reviews.length //9/2=4.5 //let take one example we have a 2 reviews one is 5 and other is 4 thats means avg=9 and since there is 2 reviews its length is 2 
        }
        await course?.save()

        const notification ={
            title:"New Reviews Recieve",
            message:`${user.name} has given a reviews in ${course?.name}`
        }
        //create notification
        res.status(200).json({success:true, course})

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
}

//add reply in review
interface IAddReviewReplyData{
    courseId:string;
    comment:string;
    reviewId:string;
}

export const addReplyToReview = async(req:Request|any, res:Response, next:NextFunction)=>{
    try {


        const {courseId, comment, reviewId} = req.body
        const course = await courseModel.findById(courseId)
        if(!course){
            return next(new ErrorHandler("course not found", 404))
        }
        const review = course.reviews.find((rev:any)=>rev._id.toString() === reviewId)
        if(!review){
            return next(new ErrorHandler("Review not found", 404))
        }
        const user= req.user
        const replyData:any = {
            user, comment
        }
        if(!review.commentReplies){
            return review.commentReplies=[]
        }
        review.commentReplies?.push(replyData)

         await course.save()
         res.status(200).json({
            success:true,
            course
         })
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
        
    }
}