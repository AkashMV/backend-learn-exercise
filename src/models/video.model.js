import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile:{
        type: String,
        required: true
    },
    thumbnail:{
        type: String,
        required: true,
    },
    title:{
        type:String,
        required: true
    },
    description:{
        type:String,
    },
    duration:{
        type:Number,
        required: true
    },
    views: {
        type: Number,
        defualt: 0
    },
    published: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    videoId: {
        type: String,
        required: true,
    },
    thumbnailId : {
        type: String,
        required: true
    },
    keywords: [{
        type: String
    }]
},{timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("videos", videoSchema)