
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    jobavatar:{
        type : String,
        required : false,
    },
    requiredSkills: {
      type :  [String],
      default : []
    }, // Array of skills needed
    postedAt: {
      type: Date,
      default: Date.now
    }
  });
  
export const Job = mongoose.model("Job", JobSchema);