import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res)=>{
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400, "enter a userid")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400, "no user by the given id")
    }
    const userSubscriptions = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                }
            }
        ]
    )
    const subscriberCount = userSubscriptions[0].subscribers.length
    let videoViews = 0
    const videos = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
            }
        }
    ])
    if(!videos){
        throw new ApiError(400, "internal server error")
    }
    if(videos[0].videos || videos[0].videos.length > 0){
        videos[0].videos.forEach((video)=>{videoViews += video.videoViews})
    }
    const totalVideos = videos[0].videos.length
    return res.status(200).json({"subscribers": subscriberCount, "views": videoViews, "videos": totalVideos})
})


const getChannelVideos = asyncHandler(async (req, res)=>{
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400, "enter a userid")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400, "no user by the given id")
    }
    const videos = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
            }
        }
    ])
    if(!videos){
        throw new ApiError(500, "internal server error")
    }
    return res.status(200).json(videos[0].videos)
})

export {
    getChannelStats, 
    getChannelVideos
}