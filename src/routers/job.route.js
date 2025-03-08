import { Router } from "express";
import { Addjob , matchjob  } from "../controllers/job.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/addjob").post(
    upload.single("jobavatar"),
    Addjob);

    router.route("/findjob").post(matchjob)

export default router;