import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{timestamps:true});
export const Comment = mongoose.model('Comment',commentSchema);