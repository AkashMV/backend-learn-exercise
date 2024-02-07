import mongoose, {Schema} from "mongoose"

const playlistSchema = new Schema({})

export const Playlist = mongoose.Model("playlist", playlistSchema)