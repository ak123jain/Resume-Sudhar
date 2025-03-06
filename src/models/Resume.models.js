import { GenerativeModel } from "@google/generative-ai";
import mongoose from "mongoose";


 
const resumeSchema= new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : false
    },
    resumeText:{
        type :  [String],
        required : true
    },
    resumeId:{
        type : String,
        required :  true
    },
    filename:{
        type : String,
        required : false
    },
    fileType: {
        type: String,
        enum: ["pdf", "image"], // To differentiate PDF and image uploads
        required: false
    },
    avatar:{
        type : String,
        required : false
    },
    fileUrl:{
        type : String,
        required : false
    },
    uploadedAt: {
        type: Date,
        default: Date.now
      },
      matchScore: {
        type: Number, // AI-generated match score (0-100)
        default: null
      },
      extractedSkills : {
        type : Object,
        default : {}
      }, // Extracted skills from AI analysis
      suggestions: String // AI-generated suggestions to improve the resume
})

export const Resume = mongoose.model("Resume", resumeSchema);