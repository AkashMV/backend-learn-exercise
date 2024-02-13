import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import mongoose from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const user = req.user
    const { page = 0, limit = 10, sortBy="likes", sortType=-1 } = req.query
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "no video found with the given id")
    }    
    console.log(limit)
    const comments = await Comment.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "owner",
                foreignField: "_id",
                as: "temp",
                pipeline: [
                    {
                        $match: {
                            _id: new mongoose.Types.ObjectId(videoId)
                        }
                    }
                ]
            }
        },
        {
            $match: {
                temp: { $ne: [] } 
            }
        },
        {
            $sort: {
                sortBy: sortType
            }
        },
        {
            $skip: page*limit
        }
    
    ])
    const output = await Comment.aggregatePaginate(comments, {page: page, limit: limit})
    .then((results)=>{return results}).catch((e)=>{return e;})
    console.log(output.docs);
    if(!output || output.docs.length < 1){
        return res.status(200).json({"message": "no results"})
    }
    const response = new ApiResponse(200, {...output.docs}, "video data fetched")
    return res.status(response.statusCode).json(response.data)

})

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
    return res.status(response.statusCode).json({"message": response.message})
})
// add a comment to a video (in future for tweets also)


const updateComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params
    const {content} = req.body
    const comment = await Comment.findByIdAndUpdate(commentId, {content: content})
    if(!comment){
        throw new ApiError(400, "no comment found witht the given comment id")
    }
    return res.status(200).json({"message": "comment updated successfully"})
})
// implement the functionality but don't make it available for users

const deleteComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params
    const user = req.user
    if(!user){
        throw new ApiError(400, "You must be logged in to delete a comment")
    }
    const deletedComment = await Comment.deleteOne({$and: [{_id: commentId}, {owner: user._id}]})
    console.log(deletedComment)
    if(deletedComment.deletedCount == 0){
        throw new ApiError(400, "no comment with the given comment id found belonging to the current user")
    }
    const response = new ApiResponse(200, deletedComment, "comment deleted successfully")
    return res.status(200).json({"message": response.message})
})


export {
    getVideoComments,
    addComment, 
    updateComment, 
    deleteComment
}