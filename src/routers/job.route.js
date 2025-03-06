import { Router } from "express";
import { Addjob  } from "../controllers/job.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/addjob").post(
    upload.single("jobavatar"),
    Addjob);

export default router;