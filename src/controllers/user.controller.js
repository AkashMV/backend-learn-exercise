import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"


const generateTokens = async (user) => {
    try{
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "Internal Server error")
    }
}

const registerUser = asyncHandler( async (req, res)=>{
    const {fullName, email, userName, password} = req.body
    console.log(fullName, email, userName, password);
    
    // if(
    //     [fullName, email, userName, password].some((field)=>field?.trim() === "")
    // ){
    //     throw new ApiError(400, "All fields are compulsary")
    // }
    if(fullName === "" || !fullName ){
        throw new ApiError(400, "full name is not specified")
    }else if(userName === ""  || !userName){
        throw new ApiError(400, "user name is not specified")
    }else if(email === ""  || !email){
        throw new ApiError(400, "email is not specified")
    }else if(password === "" || !password){
        throw new ApiError(400, "password is not specified")
    }
    
    const userExists = await User.findOne({$or: [{userName}, {email}]})
    if(userExists){
        throw new ApiError(409, "Username or email already exists")
    }else{
        const aviPath = req.files?.avatar[0]?.path
        let coverPath
        if(req.files && req.files["coverImage"] && req.files["coverImage"].length > 0){
            coverPath = req.files.coverImage[0].path
        }else{
            coverPath = ""
        }
        

        if(!aviPath){
            throw new ApiError(400, "avatar is not specified")
        }
        const avatar = await uploadCloudinary(aviPath)
        const coverImage = await uploadCloudinary(coverPath)
        console.log(coverImage);
        const user = await User.create({
            userName: userName.toLowerCase(),
            email: email,
            avatar: avatar.url,
            fullName: fullName,
            coverImage: coverImage?.url || "",
            password: password
        })
        const userCreated = await User.findById(user._id).select(
            "-password -refreshToken"
        )


        if(!userCreated){
            throw new ApiError(500, "Database error")
        }

        const apiResponse = new ApiResponse(201, userCreated, "User registration successfull")
        
        return res.status(apiResponse.statusCode).json(
            apiResponse
        )
    }
})


const loginUser = asyncHandler(async (req,res)=>{
    const {userName, password, email} = req.body
    if (!userName && !email){
        throw new ApiError(400, "Provide either username or email")
    }
    if(!password){
        throw new ApiError(400, "Password not provided")
    }


    //we use mongoDB operator down here
    const user = await User.findOne({$or: [{userName}, {email}]})
    if(!user){
        throw new ApiError(404, "User not found")
    }
    
    const isPassCorrect = await user.isPasswordCorrect(password)
    if(!isPassCorrect){
        throw new ApiError(401, "Incorrect password")
    }
    console.log(user);
    const {accessToken, refreshToken} = await generateTokens(user)
    const loggedInUser = await User.findById(user.id).select("-_id -password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    const response = new ApiResponse(200, loggedInUser, "Login Successfull")
    return res.status(response.statusCode).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options)
    .json(
        response.data
    )

})

const logoutUser = asyncHandler(async (req, res)=>{
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    )
    console.log(user);
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "log out success"))
})

// need to make some changes/clarifications
const changeCurrPassword = asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body
    const user = await User.findById(req.user?._id)

    //improvisations needed
    if(!(await user.isPasswordCorrect(oldPassword))){
        throw new ApiError(400, "old password provided is incorrect")
    }
    if(newPassword != confirmPassword){
        throw new ApiError(400,"passwords do not match")
    }

    user.password = confirmPassword
    await user.save({validateBeforeSave: false})

    const response = new ApiResponse(200, {}, "password changed successfully")
    return res.status(response.statusCode).json(response.message)
})

const getCurrentUser = asyncHandler(async (req, res)=>{
    return res.status(200).json(req.user)
})


const updateUser = asyncHandler(async (req, res)=>{
    const {fullName, email} = req.body
    if(email){
        const emailExists = await User.findOne({email: email})
        if(emailExists){
            throw new ApiError(400, "Email already exists")
        }
    }
    let aviPath, coverPath;
    if(req.files && req.files["avatar"] && req.files["avatar"].length > 0){
        aviPath = req.files.avatar[0].path
    }else{
        aviPath = ""
    }
    if(req.files && req.files["coverImage"] && req.files["coverImage"].length > 0){
        coverPath = req.files.coverImage[0].path
    }else{
        coverPath = ""
    }
    let avatar, coverImage
    if(aviPath){
        avatar = await uploadCloudinary(aviPath)

    }
    if(coverPath){
        coverImage = await uploadCloudinary(coverPath)
    }
    const user  = await User.findByIdAndUpdate(
        req.user._id,
        {
            fullName: fullName || req.user.fullName,
            email: email || req.user.email,
            avatar: avatar?.avatar || req.user.avatar,
            coverImage: coverImage?.url || req.user.coverImage
        },
        {
            returnDocument: "after"
        }
    )
    const response = new ApiResponse(200, user, "user updation successfull")
    res.status(response.statusCode).json(response.data)
})


const getUserChannelProfile = asyncHandler(async (req, res)=>{
    const {channelname} = req.params
    if (!channelname?.trim()){
        throw new ApiError(400, "username missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: channelname?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscriberCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                createdAt: 1
            }
        }
    ])
    console.log(typeof channel);
    console.log(channel);

    if(!channel?.length){
        throw new ApiError(404, "channel not found")
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})


const getWatchHistory = asyncHandler(async (req, res)=>{
    const watchHistory = await User.aggregate([
        {
            $match: {
                id: new mongoose.Types.ObjectId(req.user._id)
            },
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]

            }
        }
    ])

    
})

export {
    registerUser, 
    loginUser, 
    logoutUser, 
    updateUser, 
    changeCurrPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory
}
//export 