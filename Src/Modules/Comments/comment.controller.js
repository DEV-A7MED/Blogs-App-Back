import commentModel from "../../../DB/models/CommentModel.js"
import userModel from "../../../DB/models/UserModel.js"

/**--------------------------------
    * @desc Create New Comment
    * @route    /api/comment/create-comment
    * @method   POST
    * @access   Private (only loggedIn users)
-----------------------------------*/ 
const createComment=async(req,res,nxt)=>{

    const user=await userModel.findById(req.user._id)

    // create comment and save in DB
    const comment=await commentModel.create({
        text:req.body.text,
        postId:req.body.postId,
        createdBy:req.user._id,
        userName:user.userName
    })
    
    comment?res.status(201).json({message:"comment created",comment}):nxt(new Error("fail to add comment ,try again"))


}
/**--------------------------------
    * @desc Get All Comments

    * @route    /api/comment/
    * @method   GET
    * @access   Private (only admin)
-----------------------------------*/ 
const getAllComments=async(req,res,nxt)=>{

    const comments = await commentModel.find()
        .sort({createdAt:-1})
        .populate("createdBy",["-password"]);
    res.status(200).json({ message: 'Done', comments });
}

/**--------------------------------
    * @desc Delete Comment
    * @route    /api/comment/:commentId
    * @method   DELETE
    * @access   Private (only admin and owner of post )
-----------------------------------*/

const deleteComment=async(req,res,nxt)=>{
    const {_id,role}=req.user;
    const {commentId}=req.params;
    // check if comment exist in DB
    const comment=await commentModel.findById(commentId);
    if(!comment)return nxt(new Error("in-valid comment",{cause:404}))
    // check for delete comment auth
    if(comment.createdBy.toString() != _id && role != "Admin")return nxt(new Error("un-authorized user to delete comment",{cause:400}))
    // delete comment
    const deletedComment=await commentModel.findByIdAndDelete(commentId)
    // check comment has been deleted or not
    deletedComment? res.status(200).json({message:"comment has been deleted"}):nxt(new Error("faile to delete comment"),{cause:400})

}
/**--------------------------------
    * @desc Update Comment 
    * @route    /api/comment/update-comment/:commentId
    * @method   PUT
    * @access   Private (only owner of the comment )
-----------------------------------*/
const updateComment=async(req,res,nxt)=>{
    const{commentId}=req.params;
    const{_id}=req.user;
    const{text}=req.body
    // check if comment exist inDB
    const comment=await commentModel.findById(commentId);
    if(!comment)return nxt(new Error ("iv-valid comment",{cause:404}))
    // check if user authorized to update comment
    if(comment.createdBy.toString() !== _id.toString())return nxt(new Error ("Un-Authorized user to update comment",{cause:403}))
    
    // update comment with new values
    const updatedComment=await commentModel.findByIdAndUpdate(commentId,{
        $set:{
            text
        }
    },
    {
        new:true
    }).populate("createdBy",["-password"])
    updatedComment?res.status(200).json({ message: "Done", updatedComment }):nxt(new Error(' fail to update comment', { cause: 400 }))
    
}

export{
    createComment,
    getAllComments,
    deleteComment,
    updateComment
}