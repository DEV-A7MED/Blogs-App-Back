import mongoose, { Schema } from "mongoose";
import { systemRoles } from "../../Src/Utils/systemRoles.js";

const userSchema = new Schema(
    {
        userName:{
            type:String,
            trim:true,
            required: [true, 'userName is required'],
            min: [2, 'minimum length 2 char'],
            max: [20, 'max length 2 char']
        },
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
            minlength:8
        },
        profilePhoto:{
            type:Object,
            default:{
                url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
                public_id:null
            }
        },
        bio:String,
        role: {
            type: String,
            default: systemRoles.USER,
            enum: [systemRoles.USER, systemRoles.ADMIN]
        },
        isConfirmed:{
            type:Boolean,
            default:false
        },
        customId:String,
    },
    {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);
userSchema.virtual("posts",{
    ref:"post",
    foreignField:"createdBy",
    localField:"_id"
})
const userModel=mongoose.models.user||mongoose.model("user",userSchema)
export default userModel;