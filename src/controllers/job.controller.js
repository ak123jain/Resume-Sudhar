import { asynchandler } from "../utils/asynchandler.js"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
 const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

    const skillsArray =  requiredSkills.split(",").map(skill => skill.trim()); // Convert to array

    const job = await Job.create({
        title , 
        description ,
         company , 
         location ,
         jobavatar : upload.url ,
          requiredSkills : skillsArray
        });

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

// ✅ Helper function to clean AI response text
const cleanResponseText = (text) => {
    // Remove code fences like "```json" at the beginning and "```" at the end
    return text.replace(/```json\s*/i, "").replace(/```/g, "").trim();
};

const extracskill = (text) =>{
    try {
        const  cleanedtext = cleanResponseText(text);
        const skilldata= JSON.parse(cleanedtext);
        console.log("Skill Data: 😍😍😍😍", skilldata);
        
        const extractedSkills = skilldata.extractedSkills;
        console.log("Extracted Skills: upper function 👌👌👌", extractedSkills);
        
        return extractedSkills;
    } catch (error) {
        console.log("Error in extracting skills: ", error);
        
    }
}

export const matchjob = asynchandler(async(req , res)=>{
    const {extractedText} = req.body;

    if (!extractedText) {
        throw new ApiError(400 , "Extracted text is required");
        
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
    Extract the key skills from the following resume. Return ONLY a valid JSON object in the format:
    {
      "extractedSkills": ["skill1", "skill2", "skill3"]
    }
    
    Resume Text:
    ${extractedText}
    `;

    let extractedskill = "";

    try {
        const response = await model.generateContent(prompt);
        console.log("Response from AI: ",  JSON.stringify(response));  

        
        if (!response.response || !response.response.candidates || response.response.candidates.length === 0) {
            throw new Error("Invalid or empty response from Gemini AI");
        }


        const aiResponseText = response.response.candidates[0]?.content?.parts[0]?.text;

        extractedskill = extracskill(aiResponseText);
        
    } catch (error) {
        console.log("Error in AI response: ", error);
        
    }

    console.log("Extracted Skills:🤣🤣🤣🤣 ", extractedskill);


    if (extractedskill.length === 0) {
        throw new ApiError(400 , "No skills extracted from the resume");
    }

    
    console.log("Is extractedskill an array?", Array.isArray(extractedskill)); // Should print true
    
     

    console.log("Extracted Skills: lower function 👌👌👌", extractedskill);

    
    

    const job = await Job.find({requiredSkills : { $in :  extractedskill}});

    console.log(" Job: 😁😁😁😁", job);
     
    

    return res.status(200).json(new ApiResponse(200 , job , "Jobs fetched successfully"));
})
