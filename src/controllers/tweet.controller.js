import {Tweet} from "../models/tweet.model.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

const createTweet = asyncHandler(async (req, res)=>{

})

const getTweetById = asyncHandler(async (req, res)=>{

})

const updateTweet = asyncHandler(async (req, res)=>{

})

const deleteTweet = asyncHandler(async (req, res)=>{

})

export {
    createTweet, 
    updateTweet, 
    deleteTweet, 
    getTweetById
}