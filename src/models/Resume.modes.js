import mongoose from "mongoose";

const resumeSchema= new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    filename:{
        type : String,
        required : true
    },
    fileType: {
        type: String,
        enum: ["pdf", "image"], // To differentiate PDF and image uploads
        required: true
    },
    fileUrl:{
        type : String,
        required : true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
      },
      matchScore: {
        type: Number, // AI-generated match score (0-100)
        default: null
      },
      extractedSkills: [String], // Extracted skills from AI analysis
      suggestions: String // AI-generated suggestions to improve the resume
})