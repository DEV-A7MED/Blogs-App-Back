import userModel from "../../../DB/models/UserModel.js"
import bcrypt from 'bcryptjs'

import cloudinary from "../../Utils/cloudinary.js";
import commentModel from "../../../DB/models/CommentModel.js";
import postModel from "../../../DB/models/PostModel.js";
/**--------------------------------
    * @desc Get All Users
    * @route    /api/user/getUsersProfile
    * @method   GET
    * @access   Private (only admin)
-----------------------------------*/
const getAllUsers=async(req,res,nxt)=>{
    const users=await userModel.find().select("-password").populate("posts");
    users.length?res.status(200).json(users):res.status(200).json({message:"there are no users "})
}
/**--------------------------------
    * @desc Get User Profile
    * @route    /api/user/getUserProfile/:id
    * @method   GET
    * @access   Public
-----------------------------------*/
const getUserProfile=async(req,res,nxt)=>{
    
    const user=await userModel.findById(req.params.id).select("-password").populate("posts");
    user?res.status(200).json(user):res.status(404).json({message:"in-valid user id"})
}
/**--------------------------------
    * @desc Update User Profile
    * @route    /api/user/updateProfile/:id
    * @method   PUT
    * @access   Private (only account owner)
-----------------------------------*/
const updateUserProfile=async(req,res,nxt)=>{
    if(req.body.password){
        req.body.password=bcrypt.hashSync(req.body.password,+process.env.SALT_ROUND)
    }
    // TODO @check changed password and change token (refresh token)
    const updatedUser=await userModel.findByIdAndUpdate(req.params.id,{
        $set:{
            userName:req.body.userName,
            password:req.body.password,
            bio:req.body.bio
        }
    },{new:true})
    updatedUser?res.status(200).json({message:"update done",updatedUser}):nxt(new Error("fail to update user ,try again",{cause:403}))
}
/**--------------------------------
    * @desc Get Users Count
    * @route    /api/user/getUsersCount
    * @method   GET
    * @access   Private (only Admin)
-----------------------------------*/
const getUsersCount=async(req,res,nxt)=>{
    const usersCount=await userModel.count()
    usersCount?res.status(200).json({usersCount}):nxt(new Error("fail to count users",{cause:403}))
}
/**--------------------------------
    * @desc Update User Profile Photo
    * @route    /api/user/profile/update-profile-photo
    * @method   PUT
    * @access   Private (only account owner)
-----------------------------------*/
const updateUserPhoto=async(req,res,nxt)=>{
    const{_id}=req.user;
    // check for user in DB
    const user=await userModel.findById({_id})
    if(!user)return nxt(new Error("in-valid User",{cause:404}))
    // check for user public id to destroy it
    if(user.profilePhoto.public_id != null){
        await cloudinary.uploader.destroy(user.profilePhoto.public_id)
    }
    // upload photo data to cloudinary
    const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.PICTURES_FOLDER}/Profile/${user.customId}`
    })
    // update profile photo data in DB
    user.profilePhoto={
        url:secure_url,
        public_id
    }
    const updated=await user.save()
    // check if data saved successfully and the response
    updated?res.status(200).json({message:"user photo updated successfully",profilePhoto:{url:secure_url,public_id}}):nxt(new Error("fail to update photo ,please try again"))

}
/**--------------------------------
    * @desc Delete User Account
    * @route    /api/user/profile/:userId
    * @method   DELETE
    * @access   Private (only Admin and account owner)
-----------------------------------*/
const deletUserProfile=async(req,res,nxt)=>{
    const{_id,role}=req.user
    const{userId}=req.params
    // check if the same user access delete account or admin
    if(userId != _id && role != 'Admin' )return nxt(new Error("Un-authorized user to delete",{cause:400}))
    // check if user exist in DB
    const existUser=await userModel.findById(userId)
    if(!existUser)return nxt(new Error("in-valid user",{cause:404}))
    //delete user posts
    const userPosts=await postModel.find({createdBy:existUser._id})
    if(userPosts.length>0){
        // delete user posts photos from cloudinary
        for(const post of userPosts){
            // delete post image
            await cloudinary.uploader.destroy(post.postPhoto.public_id)
            await cloudinary.api.delete_folder(`${process.env.PICTURES_FOLDER}/posts/${post.customId}`)
            // delete all comments belong to this post
            await commentModel.deleteMany({postId:post._id})
        }
        // delete all posts  
        
        await postModel.deleteMany({createdBy:existUser._id})
    }
    //find user comments in DB
    const userComments=await commentModel.find({createdBy:existUser._id})
    if(userComments.length){
        // delete all comments
        await commentModel.deleteMany({createdBy:existUser._id})
    }
    // delete user from DB
    const user=await userModel.findByIdAndDelete(userId)
    if(!user)return nxt(new Error("fail to delete user, please try again "))
    // check if user upload profile photo before and delete it  
    if(existUser.profilePhoto.public_id != null){
        // delete user profile photo  from cloudinary
            await cloudinary.uploader.destroy(existUser.profilePhoto.public_id)
        // delete user profile photo folder from cloudinary
            await cloudinary.api.delete_folder(`${process.env.PICTURES_FOLDER}/Profile/${existUser.customId}`)
        }

    return res.status(200).json({message:"User Has Been Deleted"})
}
export{
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    getUsersCount,
    updateUserPhoto,
    deletUserProfile
}