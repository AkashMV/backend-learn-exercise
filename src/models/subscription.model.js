import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    
}, {timestamps: true})


export const subscription = mongoose.model("subscription", subscriptionSchema)


//user has to be logged in to subscribe
//if not send a message asking the user to login
//if user logged in,
//create a subscription entry from the user to the channel
//displaying users subscribers
//go through the whole database, check for all entries where subscriber == user