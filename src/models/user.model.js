import mongoose,{Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    fullname:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
    },
    address:{
        type:String,
    },
    gender:{
        type:String,
    },
    phone:{
        type:String,
    },
    bio:{
        type:String,
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:'Post',
    },
    refreshToken:{
        type:String,
    },
},{timestamps:true});
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})
userSchema.methods.isPasswordCorrect = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }   
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id, //this is coming from database
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }   
    )
}
export const User = mongoose.model('User',userSchema);