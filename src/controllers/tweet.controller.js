import {Tweet} from "../models/tweet.model.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import mongoose from "mongoose"

const createTweet = asyncHandler(async (req, res)=>{
    const {content} = req.body
    if(!content){
        throw new ApiError(400, "no content given")
    }
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must login to tweet")
    }
    const tweet = await Tweet.create(
        {
            content: content,
            owner: user._id
        }
    )
    console.log(tweet)
    if(!tweet){
        throw new ApiError(500, "Internal server error")
    }
    const response = new ApiResponse(200, tweet, "tweet created successfully")
    return res.status(response.statusCode).json(response.data)
})

const getTweetsByUserId = asyncHandler(async (req, res)=>{
    const {tweeterId} = req.params
    if(!tweeterId){
        throw new ApiError(400, "tweeter id not provided")
    }
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must login to continue")
    }
    const tweets = await Tweet.find({owner: tweeterId})
    console.log(tweets);
    if(!tweets || tweets.length < 1){
        const response =new ApiResponse(200, {}, "no tweets found by the user")
        return res.status(response.statusCode).json({"message": response.message})
    }
    const response = new ApiResponse(200, {...tweets}, "tweets fetched succesfully")
    return res.status(response.statusCode).json(response.data)
})

const getTweetById = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400, "tweet id not provided")
    }
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must login to continue")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        const response =new ApiResponse(200, {}, "no tweet found")
        return res.status(response.status).json({"message": response.message})
    }
    const response = new ApiResponse(200, tweet, "tweet fetched succesfully")
    return res.status(response.statusCode).json(response.data)
})

const updateTweet = asyncHandler(async (req, res)=>{
    const {content} = req.body
    const {tweetId} = req.params
    if(!content){
        throw new ApiError(400, "no content given")
    }
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must login to tweet")
    }
    if(!tweetId){
        throw new ApiError(400, "tweet id not provided")
    }
    const tweet = await Tweet.findOne({$and: [{_id: tweetId}, {owner: user._id}]})
    if(!tweet){
        throw new ApiError(400, "tweet not found")
    }
    const editedTweet = await Tweet.findByIdAndUpdate(tweetId, {
        content: content
    },{new: true})
    if(!editedTweet){
        throw new ApiError(500, "Internal server error")
    }
    const response = new ApiResponse(200, editedTweet, "tweet updated succesfully")
    return res.status(response.statusCode).json(response.data)
})

const deleteTweet = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "you must login to tweet")
    }
    if(!tweetId){
        throw new ApiError(400, "tweet id not provided")
    }
    const tweet = await Tweet.findOne({$and: [{_id: tweetId}, {owner: user._id}]})
    const deletedTweet = await Tweet.findByIdAndDelete(tweet._id)
    if(!deletedTweet){
        throw new ApiError(200, "internal server error")
    }
    const response = new ApiResponse(200, deletedTweet, "tweet deleted successfully")
    console.log(deletedTweet)
    return res.status(response.statusCode).json(response.message)
})

export {
    createTweet, 
    updateTweet, 
    deleteTweet, 
    getTweetsByUserId,
    getTweetById
}