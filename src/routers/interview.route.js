import {Router } from "express";
 
import { generateContent } from "../controllers/InterviewPreparation.controller.js";

const router = Router();

router.route("/:resumeId/questions").get(generateContent)

export default router;