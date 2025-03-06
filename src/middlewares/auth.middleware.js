
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";


export const verifyjwt = async() =>{
    try {
        const token = req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            console.log("token is not found 💕💕💕 provided");
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("token is verified 😍😍😍😍😍");

        const user = await User.findById(decoded.id).select("-password -refreshtoken");

        if (!user) {
            console.log("user is not found 💕💕💕");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, "unauthorized beataaa😒😒😒😒")
        
    }
}