import {Comment} from "../models/comment.model.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

const getVideoComments = asyncHandler(async (req, res)=>{

})
//get all comments for the video

const addComment = asyncHandler(async (req, res)=>{

})
// add a comment to a video (in future for tweets also)

const updateComment = asyncHandler(async (req, res)=>{

})
// implement the functionality but don't make it available for users

const deleteComment = asyncHandler(async (req, res)=>{

})
// delete a comment

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}