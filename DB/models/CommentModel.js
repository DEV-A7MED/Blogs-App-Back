import mongoose, { Schema } from "mongoose";


const commentSchema = new Schema(
    {
        text:{
            type:String,
            required: [true, 'title is required'],
            
        },
        
        createdBy:{
            type:Schema.Types.ObjectId,
            ref:"user",
            required:true,
        },
        postId:{
            type:Schema.Types.ObjectId,
            ref:"post",
            required:true,

        },
    },
    {
        timestamps:true
    }
);
const commentModel=mongoose.models.comment||mongoose.model("comment",commentSchema)
export default commentModel;