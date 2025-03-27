import {Router} from 'express';
import { uploadresume , analizeresume, createresume  } from '../controllers/resume.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyjwt } from '../middlewares/auth.middleware.js';
const router = Router();

router.route("/upload").post(
     
    upload.single("resume"),
    uploadresume
)

router.route("/:resumeId/suggestion").get(analizeresume)

router.route("/createresume").post(createresume)

export default router;