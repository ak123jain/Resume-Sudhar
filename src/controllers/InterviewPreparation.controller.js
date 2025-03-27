import { asynchandler } from '../utils/asynchandler.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Resume } from '../models/Resume.models.js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateContent = asynchandler(async (req, res) => {
  const { resumeId } = req.params;

  if (!resumeId) {
    throw new ApiError(400, 'resumeId is required');
  }

  const resume = await Resume.findOne({ resumeId });

  if (!resume) {
    throw new ApiError(404, 'Resume not found');
  }

  const extractedskill = resume.extractedSkills;

  if (Object.keys(extractedskill).length === 0 || extractedskill === 0) {
    throw new ApiError(400, 'No extracted skills found in the resume');
  }

  console.log("Extracted Skills: upper function 👌👌👌", extractedskill);

  const stringformat = JSON.stringify(extractedskill);
  
  console.log("stringformat: upper function 👌👌👌", stringformat);

  const prompt = `
  You are an expert technical interviewer. Generate **3 job interview questions** based on these selected skill categories.
  Provide a **detailed answer** for each question.
  
  **Relevant Skills:** ${stringformat}

  **Rules:**
  - Questions should be **directly related to the selected skills**.
  - No generic or behavioral questions (e.g., "Tell me about yourself").
  - Keep questions **short, clear, and practical**.
  - Each question should be followed by a **detailed technical answer**.

  Format:
  **Question 1:** [Generated Question]
  **Answer:** [Detailed Answer]

  **Question 2:** [Generated Question]
  **Answer:** [Detailed Answer]

  **Question 3:** [Generated Question]
  **Answer:** [Detailed Answer]

  create a space between each question and answer. 

  write ans in limited 5 lines only

   
  `;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const response = await model.generateContent(prompt);
    const aiResponse =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No questions generated';

    return res
      .status(200)
      .json(
        new ApiResponse(true, aiResponse ,'Questions generated successfully'),
      );
  } catch (error) {
    console.error('❌ AI Error:', error);
    return res.status(500).json({ error: 'AI failed to generate questions.' });
  }
});

