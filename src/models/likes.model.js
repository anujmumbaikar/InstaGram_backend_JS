import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    isLike:{
        type:Boolean,
        default:true,
    }
},{timestamps:true});
export const Like = mongoose.model('Like',likeSchema);