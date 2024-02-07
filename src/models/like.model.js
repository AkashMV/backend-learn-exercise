import mongoose, {Schema} from "mongoose"

const likeSchema = new Schema({})

export const Like = mongoose.Model("like", likeSchema)