import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

const getVideoComments = asyncHandler(async (req, res)=>{
    const {video} = req.params
    console.log(video);
})
//get all comments for the video

const addComment = asyncHandler(async (req, res)=>{
    const {videoId} = req.params
    const {content} = req.body
    const owner = req.user
    if(!content){
        if(content === "" || content === " "){
            throw new ApiError(400, "please add content to your comment")
        }
        throw new ApiError(400, "no comment received")
    }

    if (!owner){
        throw new ApiError(400, "You must be logged in to add a comment")
    }
    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(400, "no video with the given video id")
    }
    const comment = await Comment.create(
        {
            owner: owner,
            video: video,
            content: content
        }
    )
    if(!comment){
        throw new ApiError(500, "Internal Server Error")
    }
    const response = new ApiResponse(200, {comment}, "comment posted successfully")
    res.status(response.statusCode).json({"message": response.message})
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