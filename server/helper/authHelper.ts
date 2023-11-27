import bcrypt from "bcryptjs";

export const hashPassword = async(password:string)=>{
    try{
        const salt = 10
        const hashedPassword = await bcrypt.hash(password, salt)
        return hashedPassword
    }
    catch(e){
console.log(e)
    }

}
export const comparePassword = async (password:string, hashedPassword:string):Promise<boolean>=>{
    return bcrypt.compare(password,hashedPassword)
}
