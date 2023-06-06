import mongoose, { Schema } from "mongoose";


const postSchema = new Schema(
    {
        title:{
            type:String,
            trim:true,
            required: [true, 'title is required'],
            min: [2, 'minimum length 2 char'],
            max: [20, 'max length 2 char']
        },
        description:{
            type:String,
            trim:true,
            required: [true, 'title is required'],
            min: [10, 'minimum length 2 char'],
            
        },
        createdBy:{
            type:Schema.Types.ObjectId,
            ref:"user",
            required:true,
        },
        category:{
            type:String,
            required:true,

        },
        postPhoto:{
            type:Object,
            default:{
                url:"",
                public_id:null
            }
        },
        likes:[
            {
                type:Schema.Types.ObjectId,
                ref:"user"
            }
        ],
        customId:String,
    },
    {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);
postSchema.virtual("comments",{
    ref:"comment",
    localField:"_id",
    foreignField:"postId"
})
const postModel=mongoose.models.post||mongoose.model("post",postSchema)
export default postModel;