import { fileTypeFromBuffer } from "file-type";  // ✅ Correct import
import Tesseract from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
 import { Resume } from "../models/Resume.models.js";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
import { uploadOnCloudinary } from "../utils/cloudinary.js";



// ✅ Validate if the uploaded file is a proper PDF
const isValidPDF = async (filePath) => {
    try {
        const buffer = fs.readFileSync(filePath);
        const type = await fileTypeFromBuffer(buffer);  // ✅ Fixed function
        return type?.mime === "application/pdf";
    } catch (error) {
        console.error("❌ Error detecting file type:", error);
        return false;
    }
};

import fs from "fs";
import extract from "pdf-text-extract";
import { upload } from "../middlewares/multer.middleware.js";

const extractTextFromPDF = async (filePath) => {
    return new Promise((resolve, reject) => {
        extract(filePath, (error, text) => {
            if (error) {
                console.error("❌ Error extracting text:", error);
                reject(new Error("Failed to extract text from PDF"));
            } else {
                resolve(text || "No text extracted");
            }
        });
    });
};

 

 
// const extractSkillsFromText = (text) => {
//     const skills = {
//         Languages: [],
//         RelevantCoursework: [],
//         Technologies: [],
//         Tools: [],
//         Databases: []
//     };

//     const textString = text.toString()
//         .replace(/\r/g, "") // Remove carriage returns
//         .replace(/\u200b/g, "") // Remove zero-width spaces
//         .replace(/\u00A0/g, " ") // Replace non-breaking spaces with normal spaces
//         .trim();

//     const lines = textString.split("\n").map(line => line.trim()).filter(line => line);

//     let currentCategory = null;

//     for (let line of lines) {
//         const lowerLine = line.toLowerCase();

//         if (lowerLine.startsWith("languages")) {
//             currentCategory = "Languages";
//         } else if (lowerLine.startsWith("relevant coursework")) {
//             currentCategory = "RelevantCoursework";
//         } else if (lowerLine.startsWith("technologies")) {
//             currentCategory = "Technologies";
//         } else if (lowerLine.startsWith("tools")) {
//             currentCategory = "Tools";
//         } else if (lowerLine.startsWith("database")) {
//             currentCategory = "Databases";
//         } else if (currentCategory) {
//             // Improved splitting for merged words (e.g., "WebSocketsDocker" → "WebSockets, Docker")
//             let cleanedLine = line.replace(/([a-z])([A-Z])/g, "$1, $2"); // Add a comma before uppercase letters (camelCase fix)
//             let items = cleanedLine.split(/[,|]/)
//                 .map(skill => skill.trim())
//                 .filter(skill => skill && skill !== "​"); // Remove empty values and Unicode space

//             skills[currentCategory].push(...items);
//         }
//     }

//     return skills;
// };

 


// ✅ Extract text from PDFs (Fallback to OCR if necessary)
// ✅ Extract text from PDFs (Fallback to OCR if necessary)
 

 
// ✅ Extract text from scanned image resumes (OCR)
 
const extractSkillsFromText = (text) => {
    const skills = {
        Languages: [],
        RelevantCoursework: [],
        Technologies: [],
        Tools: [],
        Databases: []
    };

    console.log("Raw Text:", JSON.stringify(text));

    // Clean up text: remove unwanted hidden characters
    const textString = text.toString()
        .replace(/\r/g, "") // Remove carriage returns
        .replace(/\u200b/g, "") // Remove zero-width spaces
        .replace(/\u00A0/g, " ") // Replace non-breaking spaces with normal spaces
        .trim();

    const lines = textString.split("\n").map(line => line.trim()).filter(line => line);

    let currentCategory = null;

    for (let line of lines) {
        const lowerLine = line.toLowerCase();

        if (/languages:/i.test(line)) {
            currentCategory = "Languages";
        } else if (/relevant coursework:/i.test(line)) {
            currentCategory = "RelevantCoursework";
        } else if (/technologies:/i.test(line)) {
            currentCategory = "Technologies";
        } else if (/tools:/i.test(line)) {
            currentCategory = "Tools";
        } else if (/database[s]?:/i.test(line)) {
            currentCategory = "Databases";
        }

        if (currentCategory && line.includes(":")) {
            // Extract text after the colon
            let extractedText = line.split(":")[1]
                .replace(/([a-z])([A-Z])/g, "$1, $2") // Add a comma before capital letters (fix for merged words)
                .replace(/Web, Sockets/g, "WebSockets") // Fix incorrect splitting of WebSockets
                .replace(/Next, js/g, "Next.js") // Fix Next.js
                .replace(/Postgre, SQL/g, "PostgreSQL") // Fix PostgreSQL
                .replace(/Fire, base/g, "Firebase") // Fix Firebase Firestore
                .trim();

            let items = extractedText.split(/[,|]/)
                .map(skill => skill.trim())
                .filter(skill => skill && skill !== "​"); // Remove empty values and Unicode spaces

            skills[currentCategory].push(...items);
        }
    }

    console.log("✅ Extracted Skills:", skills);
    return skills;
};


const extractTextFromImage = async (filePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(filePath, "eng");
        return text;
    } catch (error) {
        console.error("❌ Error processing image:", error);
        throw new ApiError(500, "Failed to extract text from image");
    }
};

// ✅ Extract numeric match score from AI response
const extractMatchScore = (responseText) => {
    const match = responseText.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

 

// ✅ Resume Upload Controller
export const uploadresume = asynchandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Resume file is required");
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    const uload =  await uploadOnCloudinary(filePath);

    console.log("✅ File uploaded:", filePath);

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: "Uploaded file not found!" });
    }

    let extractedText = "";
    

    try {
        if (fileType === "application/pdf") {
            extractedText = await extractTextFromPDF(filePath);
            

        } else if (fileType.startsWith("image/")) {
            extractedText = await extractTextFromImage(filePath);
        } else {
            return res.status(400).json({ error: "Unsupported file type" });
        }

        console.log("✅ Extracted text:", extractedText);
        

        if (!extractedText || extractedText.length === 0) {
            throw new ApiError(500, "Failed to extract text from resume");
        }

        

        // ✅ AI Analysis
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // ✅ Correct Model Name

        const prompt = `
        You are an expert resume evaluator. Analyze the resume and provide a **short and structured** feedback summary with scores.
        
        **📌 Expected Response Format (Strictly Follow This Format)**
        1️⃣ **Format - (Score/100):** [1 short sentence]  
        2️⃣ **Skills - (Score/100):** [1 short sentence]  
        3️⃣ **Style - (Score/100):** [1 short sentence]  
        
        🚨 **Rules for Response:**                                                                          
        - Keep feedback under **3 lines**.                                        
        - Use **strong, action-driven** language.                                         
        - Be **direct & professional** with **no extra details**.                             
        
        **Resume Text:**           
        ${extractedText}
        `;

        const extractedSkills = extractSkillsFromText(extractedText);

        const resume = await Resume.create({
            resumeText: extractedText,
            resumeId: Date.now().toString(),
             avatar: uload.url,
             extractedSkills 
        });


        await resume.save();


        let matchScore = null;
        let explanation = "No response";

        try {
            const  response = await model.generateContent(prompt);
            console.log("🟢 AI Raw Response:", JSON.stringify(response, null, 2));  // ✅ Log entire AI response

            if (!response.response || !response.response.candidates || response.response.candidates.length === 0) {
                throw new Error("Invalid or empty response from Gemini AI");
            }
        
            // ✅ Extract text safely
            explanation = response.response.candidates[0]?.content?.parts[0]?.text || "No explanation available";
            matchScore = extractMatchScore(explanation);
        } catch (error) {
            console.error("❌ AI Error:", error);
            explanation = "AI failed to analyze the resume.";
        }

        // ✅ Safely delete uploaded file after processing
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            console.warn("⚠️ Warning: Failed to delete file", error);
        }

        return res.status(200).json(
            new ApiResponse(200, { extractedText, matchScore, explanation }, "Resume uploaded successfully")
        );
    } catch (error) {
        console.error("❌ Error processing resume:", error);
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
});


 export const analizeresume = asynchandler(async (req, res) => {

    const  {resumeId} = req.params;

    console.log("🟢 Resume ID:", resumeId);
    

    const  resume = await Resume.findOne({resumeId : resumeId});


    if(!resume){
        throw new ApiError(404,"Resume not found")
    }

    const  extractedText = resume.resumeText;

    // 📝 AI Prompt for Resume Analysis
    const prompt = `
    You are an expert resume reviewer. Provide **structured suggestions** to improve the resume. 
    
    **📌 Expected Response Format (Strictly Follow This Format)**
    1️⃣ **Clarity & Readability:** [1 short improvement]  
    2️⃣ **Skills & Keywords:** [1 short improvement]  
    3️⃣ **Professional Tone:** [1 short improvement]  

    **Rules for Response:**  
    - Keep feedback **under 3 lines**.  
    - Use **direct, action-driven** language.  
    - Be **professional** and **helpful**.  

    **Resume Content:**  
    ${extractedText}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // ✅ Correct Model Name

    let aiSuggestions = "No suggestions available";
    try {
        const response = await model.generateContent(prompt);
        console.log("🟢 AI Raw Response:", JSON.stringify(response, null, 2));  // ✅ Log entire AI response
    
        aiSuggestions = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestions available";
    } catch (error) {
        console.log("❌ AI Error:", error);
        
    }

    return res.status(200).json(
        new ApiResponse(200, { aiSuggestions }, "Resume analyzed successfully")
    );
 });


