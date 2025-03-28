import mongoose from "mongoose";

const followerSchema = new mongoose.Schema({
    userfollowers:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    userfollowing:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    isFollowing:{
        type:Boolean,
        default:true,
    }
},{timestamps:true});
export const Follower = mongoose.model('Follower',followerSchema);