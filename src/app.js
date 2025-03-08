import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();  

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())








// import userRouter from "./routers/userRouter.js";
import resumeRouter from "./routers/resume.route.js";
import jobRouter from "./routers/job.route.js";
import interviewRouter from "./routers/interview.route.js";

// app.use('/users',userRouter)
app.use('/resume',resumeRouter)
app.use('/job',jobRouter)
app.use('/interview',interviewRouter)

export {app}