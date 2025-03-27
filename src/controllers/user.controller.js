import { asynchandler } from "../utils/asynchandler.js"
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generatetoken = async(userId) =>{
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save();

    console.log("user after refresh token save", user);

    return {accessToken, refreshToken};

}

export const registeruser = asynchandler(async (req , res)=>{

    const { fullname, email, username, password } = req.body;

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    console.log("req.files", req.body);
    

    const fullnamelowercase = fullname.toLowerCase();
    const usernameLowercase = username.toLowerCase();

    console.log("fullnamelowercase", fullnamelowercase);
    

    // check if user already exist
    const existinguser = await User.findOne({
        $or: [{  fullname : fullnamelowercase }, { username: usernameLowercase }],
    })

    if (existinguser) {
        throw new ApiError(400, "User already exist");
    }

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading the avatar");
    }


    const user = await User.create({
        fullname: fullnamelowercase,
        email,
        avatar: avatar?.url,
        username: usernameLowercase,
        password,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }


    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})


export const loggedinuser = asynchandler(async (req, res) => {

    const {username, password , email } = req.body;

    console.log("ritu ", req.body.password);
    console.log("ritu ", req.body.email);
    console.log("ritu ", req.body.username);

    if (!username || !password) {
        throw new ApiError(404, "username or password is invalid");
      }
    

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {    
        throw new ApiError(404, "User not found");
    }

    const ispasswordcorrect = await user.isPasswordCorrect(password);

    if (!ispasswordcorrect) {
        throw new apiError(401, "Invalid user credentials")
        }

        const {accessToken , refreshToken} = await generatetoken(user._id);

         

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        

        const options = {
            httpOnly: true,
            secure: false,
            
            sameSite: "Lax", // Adjust as needed for cross-site requests
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          };
        
          console.log("Cookies are being set:");
          console.log("AccessToken:", accessToken);
          console.log("RefreshToken:", refreshToken);
          console.log("Options:", options);

        return res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201, 
                {
                    user : loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

export const RefreshAccessToken = asynchandler(async (req , res)=>{
    console.log("Received cookies: ", req.cookies);

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    console.log("decoded", decoded);
    

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log("user", user);

    console.log("refresh token", user.refreshToken);

    if (user?.refreshToken !== incomingRefreshToken) {
        throw new ApiError(400, "Invalid refresh token");
    }
    

    const options = {
        httpOnly: true,
        secure:  true,
    }

    const {accessToken , newrefreshToken} = await generatetoken(user._id);

    return res.status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
        new ApiResponse(201, {accessToken, newrefreshToken}, "Access token refreshed successfully")
    )
})

export const updateusersetails = asynchandler(async(req , res)=>{

    const {userId} = req.user._id;

    const {fullname , email , username} = req.body;

    const user = User.findByIdandUpdate(
        userId,
        {
            $set:{
                fullname: fullname,
                username: username,
                email: email,
            }
        },{new : true}
    ).select("-password ");

    return res.status(200).json(
        new ApiResponse(200, user, "User details updated successfully"))

})

export const updateavatar = asynchandler(async(req , res)=>{
    const userid = req.user._id;

    const avatarlocalpath = req.files?.avatar[0]?.path;

    if (!avatarlocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarlocalpath);

    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading the avatar");
    }

    const user = await User.findByIdAndUpdate(
        userid,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res.status(201).json(
        new ApiResponse(201, user, "Avatar updated successfully")
    )
})

