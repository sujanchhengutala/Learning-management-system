import mongoose,{Document, Schema, Model} from "mongoose";
import { IUser } from "./userModel";
interface IComment extends Document{
    user:IUser;
    question:string;
    questionReplies?:IComment[]
}
export interface IReview extends Document{
user:IUser;
rating:number;
comment:string;
commentReplies?:IComment[];
}
interface ILink extends Document{
    title:string;
    url:string;
}
interface ICourseData extends Document{
    title:string;
    description:string;
    videoUrl:string;
    videoThumbnail:object;
    videoSection:string;
    videoLength:number;
    videoPlayer:string;
    links:ILink[];
    suggestion:string;
    question:IComment[];
}

interface ICourse extends Document{
    name:string;
    description:string;
    price:number;
    estimatedPrice?:number;
    thumbnail:object;
    tags:string;
    level:string;
    demoUrl:string;
    benifits:{title:string}[];
    prerequistes:{title:string;}[];
    reviews:IReview[];
    courseData:ICourseData[];
    ratings?:number;
    purchased?:number;
}

const reviewSchema = new Schema<IReview>({
    user:Object,
    rating:{
        type:Number,
        default:0
    },
    comment:String,
    commentReplies:[Object]
})

const linkSchema= new Schema<ILink>({
    title:String,
    url:String
})

const commentSchema = new Schema<IComment>({
    user:Object,
    question:String,
    questionReplies:[Object],
})
 

const courseDataSchema = new Schema<ICourseData>({
    title:String,
    description:String,
    videoUrl:String,
    videoSection:String,
    videoLength:Number,
    videoPlayer:String,
    links:[linkSchema],
    suggestion:String,
    question:[commentSchema]
})
const courseSchema = new Schema<ICourse>({
name:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
price:{
    type:Number,
    required:true
},
estimatedPrice:{
    type:Number
},
thumbnail:{
    public_id:{
        type:String
    },
    url:{
        type:String,
    }
},
tags:{
    required:true,
    type:String
},
level:{
    type:String,
    required:true
},
demoUrl:{
    type:String,
    required:true
},
benifits:[{title:String}],
prerequistes:[{title:String}],
reviews:[reviewSchema],
courseData:[courseDataSchema],
ratings:{
    type:String,
    default:0
},
purchased:{
    type:Number,
    default:0
}
})
const courseModel: Model<ICourse> = mongoose.model("Course", courseSchema)
export default courseModel