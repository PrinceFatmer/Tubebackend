import mongoose, { Schema } from "mongoose";

const likeSchema= new Schema({
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video"
    },
    comment : {
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    },
    likedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    tweet:{
        type: mongoose.Types.ObjectId,
        ref: "Tweet"
    }
},
{timestamps: true});

export const Like = mongoose.model("Like",likeSchema)