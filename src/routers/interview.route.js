import {Router } from "express";
 
import { generateContent } from "../controllers/InterviewPreparation.controller.js";

const router = Router();

router.route("/:resumeId/questions").post(generateContent)

export default router;