import { asynchandler } from "../utils/asynchandler.js"
 
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
 
import { Job } from "../models/job.models.js";

export const Addjob = asynchandler(async(req , res)=>{

    console.log("👌👌👌👌",req.body);
    

    const {title , description , company , location , requiredSkills} = req.body;

    console.log(" akash : " , title , description , company , location , requiredSkills);
    

    if (!title || !description || !company || !location || !requiredSkills) {
        throw new ApiError(400 , "All fields are required");
    }



    const jobavatar = req.file?.path;

    if(!jobavatar){
        throw new ApiError(400 , "Job avatar is required");
    }

    const upload = await uploadOnCloudinary(jobavatar);

    const job = await Job.create({
        title , 
        description ,
         company , 
         location ,
         jobavatar : upload.url , requiredSkills});

    return res.status(200).json(new ApiResponse(200 , job , "Job added successfully"));
})

const searchjob = asynchandler(async(req , res)=>{
    const {query , sort , category , sortType} = req.query;


    const filter = {};
    
    if (query) {
        filter.$or = [
            {jobtitle : { $regex : query , $options : "i"}},
            {description : { $regex : query , $options : "i"}},
            {company : { $regex : query , $options : "i"}},
            {location : { $regex : query , $options : "i"}},
        ]
    }

    if (category) {
        filter.category = category;
    }

    const jobs = await Job.find(filter).populate({path : "creator" , select : "name photoUrl"})

    return res.status(200).json(new ApiResponse(200 , jobs , "Jobs fetched successfully"));

})


export const getjobByid = asynchandler(async(req , res)=>{

    const {id} = req.params.jobId;

    const job = await Job.findById(id).populate({ path: "creator", select: "name photoUrl" });

    return res.status(200).json(new ApiResponse(200 , job , "Job fetched successfully"));

})

export const getcource = asynchandler(async(req , res)=>{


    console.log("🚀 getcource route is being hit!");
    console.log("Request Params:", req.params);
    console.log("Request Query:", req.query);

    const job = await  Job.find({}) 

    return res.status(200).json(new ApiResponse(200 , job , "Job fetched successfully"));
})

