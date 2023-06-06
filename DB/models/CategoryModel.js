import mongoose, { Schema } from "mongoose";


const categorySchema = new Schema(
    {
        title:{
            type:String,
            required: [true, 'title is required'],
            unique:true
        },
        
        createdBy:{
            type:Schema.Types.ObjectId,
            ref:"user",
            required:true,
        },
    },
    {
        timestamps:true
    }
);
const categoryModel=mongoose.models.category||mongoose.model("category",categorySchema)
export default categoryModel;