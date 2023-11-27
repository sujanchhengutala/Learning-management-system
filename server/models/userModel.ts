require("dotenv").config()
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
const EmailRegexPattern:RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface IUser extends Document{
name:string;
email:string;
password:string;
avatar:{
    public_id:string;
    url:string
};
role:string
isVerified:boolean;
comparePassword:(password:string)=>Promise<boolean>;
cources:Array<{courseId:string}>;

signAccessToken:()=>string
signRefreshToken:()=>string
}
const userSchema:Schema<IUser> = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your name"]
    },
    email:{
        type:String,
        required:[true, "Please enter your email"],
        validate: function(value:string){
            return EmailRegexPattern.test(value)
        },
        unique:true
    },
    password:{
        type:String,
        minLength:[6, "Password must be atleast 6 characters"],
        select:false
    },
    avatar:{
        public_id:String,
        url:String
    },
    role:{
        type:String,
        default:"user",

    },
    isVerified:{
        type:Boolean,
        default:false
    },
    cources:[{
        courseId:String
    }]

},
{timestamps:true}
)

//hash Password
userSchema.pre<IUser>('save', async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
 
//sign access token
userSchema.methods.signAccessToken= function(){
    return jwt.sign({id:this._id}, process.env.ACCESS_TOKEN || "", {expiresIn:"5m"})
}

//sign refresh token
userSchema.methods.signRefreshToken= function(){
    return jwt.sign({id:this._id}, process.env.REFRESH_TOKEN || "", {expiresIn:"5m"})
}

//compare password
userSchema.methods.comparePassword = async function(enteredPassword:string):Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel:Model<IUser> = mongoose.model("User", userSchema)
export default userModel



