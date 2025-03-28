import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {User} from "../models/user.model.js";
import {asyncHandler} from '../utils/asyncHandler.js';
import validator from "validator";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullname,username,email,password} = req.body;
    if (!fullname || !username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    const existsUser = await User.findOne(
        {$or:[{email},{username}]}
    )
    if(existsUser){
        throw new ApiError(409, "User already exists")
    }
    if(!validator.isEmail(email)){
        throw new ApiError(400, "Invalid email")
    }
    if(password.length < 6){
        throw new ApiError(400, "Password must be at least 6 characters")
    }
    const user = await User.create({
        fullname,
        username,
        email,
        password
    })
    if(!user){
        throw new ApiError(500, "User registration failed")
    }
    return res.status(200).json(new ApiResponse(200, "User registered successfully"));
})
const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        throw new ApiError(400, "All fields are required")
    }
    if(!validator.isEmail(email)){
        throw new ApiError(400, "Invalid email")
    }
    const validateUser = await User.findOne({email})
    if(!validateUser){
        throw new ApiError(401, "User not found, kindly register")
    }
    const isPasswordValid = await validateUser.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(404,"incorrect password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(validateUser._id)
    const userLoggedIn = await User.findById(validateUser._id).select("-password -refreshToken")
    if(!userLoggedIn){
        throw new ApiError(500, "User login failed")
    }
    const options ={
        httpOnly:true,
        secure:true,
    }
    res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200,"User logged in successfully"))
})

export {registerUser, login}