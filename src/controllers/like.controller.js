import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to like")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "no video with the given video id")
    }
    const likeExists = await Like.find({$and: [{video: videoId}, {likedBy: user._id}]})
    if(likeExists.length < 1){
        const like = await Like.create(
            {
                video: videoId,
                likedBy: user._id
            }
        )
        if(!like){
            throw new ApiError(500, "internal server error")            
        }
        const response = new ApiResponse(200, like, "you liked this")
        return res.status(response.statusCode).json(response.data)
    }else{
        const unLike = await Like.findOneAndDelete({$and: [{video: videoId}, {likedBy: user._id}]})
        if(!unLike){
            throw new ApiError(500, "internal server error")
        }
        const response = new ApiResponse(200, unLike, "you unliked this")
        return res.status(response.statusCode).json(response.message)
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to like")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400, "no video with the given video id")
    }
    const likeExists = await Like.findOne({$and: [{comment: commentId}, {likedBy: user._id}]})
    if(!likeExists){
        const like = await Like.create(
            {
                comment: commentId,
                likedBy: user._id
            }
        )
        if(!like){
            throw new ApiError(500, "internal server error")            
        }
        const response = new ApiResponse(200, like, "you liked this")
        return res.status(response.statusCode).json(response.data)
    }else{
        const unLike = await Like.findOneAndDelete({$and: [{comment: commentId}, {likedBy: user._id}]})
        if(!unLike){
            throw new ApiError(500, "internal server error")
        }
        const response = new ApiResponse(200, unLike, "you unliked this")
        return res.status(response.statusCode).json(response.message)
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must be logged in to like")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400, "no video with the given video id")
    }
    const likeExists = await Like.find({$and: [{tweet: tweetId}, {likedBy: user._id}]})
    if(!likeExists){
        const like = await Like.create(
            {
                tweet: tweetId,
                likedBy: user._id
            }
        )
        if(!like){
            throw new ApiError(500, "internal server error")            
        }
        const response = new ApiResponse(200, like, "you liked this")
        return res.status(response.statusCode).json(response.data)
    }else{
        const unLike = await Like.findOneAndDelete({$and: [{tweet: tweetId}, {likedBy: user._id}]})
        if(!unLike){
            throw new ApiError(500, "internal server error")
        }
        const response = new ApiResponse(200, unLike, "you unliked this")
        return res.status(response.statusCode).json(response.message)
    }eet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user
    if(!user){
        throw new ApiError(200, "you must be logged in to continue")
    }
    const videos = await Like.find({likedBy: user._id})
    if(videos.length < 1){
        return res.status(200).json({"message": "you have not liked any videos yet"})
    }
    const response = new ApiResponse(200, {...videos}, "videos fetched successfully")
    return res.status(response.statusCode).json(response.data)
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
}