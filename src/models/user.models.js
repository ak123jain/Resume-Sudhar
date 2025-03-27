import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const usermodel = new mongoose.Schema({
    fullname :{
        type : String,
        required : true
    },
    username :{
        type : String,
        required : true,
        unique : true
    },
    email :{
        type : String,
        required : true,
        unique : true
    },
    password :{
        type : String,
        required : true
    },
    avatar:{
        type : String,
        required : true,
    },
    refreshToken:{
        type : String,
        default : ""
    },
    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Course'
        }
    ],
} , {timestamps : true})

 usermodel.pre("save" , async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password , 12)
    next()
 })

 usermodel.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}


usermodel.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

usermodel.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", usermodel);