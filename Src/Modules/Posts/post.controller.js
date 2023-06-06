import { nanoid } from "nanoid";
import cloudinary from "../../Utils/cloudinary.js";
import postModel from "../../../DB/models/PostModel.js";
import { pagination } from "../../Utils/pagination.js";
import commentModel from "../../../DB/models/CommentModel.js";

/**--------------------------------
    * @desc Create New Post
    * @route    /api/post/create-post
    * @method   POST
    * @access   Public
-----------------------------------*/
// create new post 
const createPost=async(req,res,nxt)=>{
    const{title,description,category}=req.body;
    const {_id}=req.user;
    // check if user choose post image
    if(!req.file)return nxt(new Error("please select an image first",{cause:400}))
    // custom id for cloudinary photo folder 
    const customId=nanoid(5);
    // upload photo to cloudinary
    const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.PICTURES_FOLDER}/posts/${customId}`
    })
    // create post and save in DB
    const post=await postModel.create({
        title,
        description,
        category,
        customId,
        createdBy:_id,
        postPhoto:{
            url:secure_url,
            public_id
        }
    })
    // check if post not saved to DB ,then destroy photo from cloudinary
    if(!post){
        // delete post photo from cloudinary
        await cloudinary.uploader.destroy(public_id)
        // delete post photo folder from cloudinary
        await cloudinary.api.delete_folder(`${process.env.PICTURES_FOLDER}/Posts/${customId}`)
    }
    res.status(201).json({message:"post created",post})


}
/**--------------------------------
    * @desc Get All Posts with pagination ,filter on category and sort

    * @route    /api/post/
    * @method   GET
    * @access   Public
-----------------------------------*/ 
const getAllPosts=async(req,res,nxt)=>{
    // get all posts with pagination
    const { page, size, category} = req.query
    const { limit, skip } = pagination({ page, size })
    // check if client sent pagination data
    let posts
    if(page||size){
        posts = await postModel.find()
        .limit(limit)
        .skip(skip)
        .sort({createdAt:-1})
        .populate("createdBy",["-password"])
    }
    else if(category){
        posts = await postModel.find({category})
        .sort({createdAt:-1})
        .populate("createdBy",["-password"])
    }
    else{
        posts = await postModel.find()
        .sort({createdAt:-1})
        .populate("createdBy",["-password"])
    }

    res.status(200).json({ message: 'Done', posts })

}
/**--------------------------------
    * @desc Get Single Post
    * @route    /api/post/:postId
    * @method   GET
    * @access   Public
-----------------------------------*/ 
const getSinglePost=async(req,res,nxt)=>{
    const post=await postModel.findById(req.params.postId)
                .populate("createdBy",["-password"])
                .populate("comments")

    if(!post)return nxt(new Error("in-valid post",{cause:404}))
    res.status(200).json({ message: 'Done', post })

}
/**--------------------------------
    * @desc Get Post Count
    * @route    /api/post/count
    * @method   GET
    * @access   Public
-----------------------------------*/
const getPostCount=async(req,res,nxt)=>{
    const postsCount=await postModel.count()
    if(!postsCount)return nxt(new Error("fail to count posts",{cause:404}))
    res.status(200).json({ message: 'Done', postsCount })

}
/**--------------------------------
    * @desc Delete Post
    * @route    /api/post/:postId
    * @method   DELETE
    * @access   Private (only admin and owner of post )
-----------------------------------*/

const deletePost=async(req,res,nxt)=>{
    const {_id,role}=req.user;
    const {postId}=req.params;
    // check if post exist in DB
    const post=await postModel.findById(postId);
    if(!post)return nxt(new Error("in-valid post",{cause:404}))
    // check for delete post auth
    if(post.createdBy.toString() != _id && role != "Admin")return nxt(new Error("un-authorized user to delete post",{cause:400}))
    // delete post
    const deletedPost=await postModel.findByIdAndDelete(postId)
    if(!deletedPost)return nxt(new Error("faile to delete post"),{cause:400})
    // delete post photo from cloudinary
    await cloudinary.uploader.destroy(post.postPhoto.public_id)
    // delete post photo folder from cloudinary
    await cloudinary.api.delete_folder(`${process.env.PICTURES_FOLDER}/posts/${post.customId}`)
    // delete all comments that belong to this post in DB 
    await commentModel.deleteMany({postId:post._id})
    return res.status(200).json({message:"post has been deleted"})

}
/**--------------------------------
    * @desc Update Post information 
    * @route    /api/post/update-post/:postId
    * @method   PUT
    * @access   Private (only owner of the post )
-----------------------------------*/
const updatePost=async(req,res,nxt)=>{
    const{postId}=req.params;
    const{_id}=req.user;
    const{title,description,category}=req.body
    // check if post exist inDB
    const post=await postModel.findById(postId);
    if(!post)return nxt(new Error ("iv-valid post",{cause:404}))
    // check if user authorized to update post
    if(post.createdBy.toString() !== _id.toString())return nxt(new Error ("Un-Authorized user to update post",{cause:403}))
    
    // update post with new values
    const updatedPost=await postModel.findByIdAndUpdate(postId,{
        $set:{
            title,
            description,
            category
        }
    },{new:true}).populate("createdBy",["-password"])
    updatedPost?res.status(200).json({ message: "Done", updatedPost }):nxt(new Error(' fail to update post', { cause: 400 }))
    
}
/**--------------------------------
    * @desc Update Post Image 
    * @route    /api/post/update-post-image/:postId
    * @method   PUT
    * @access   Private (only owner of the post )
-----------------------------------*/
const updatePostImage=async(req,res,nxt)=>{
    const{postId}=req.params;
    const{_id}=req.user;
    // check if user select image 
    if(!req.file)return nxt(new Error ("no image selected",{cause:404}))
    // check if post exist inDB
    const post=await postModel.findById(postId);
    if(!post)return nxt(new Error ("iv-valid post",{cause:404}))
    // check if user authorized to update post
    if(post.createdBy.toString() !== _id.toString())return nxt(new Error ("Un-Authorized user to update post image",{cause:403}))
    await cloudinary.uploader.destroy(post.postPhoto.public_id)
    const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.PICTURES_FOLDER}/posts/${post.customId}`
    })
    // update post with new values
    const updatedPostImage=await postModel.findByIdAndUpdate(postId,{
        $set:{
            postPhoto:{
                url:secure_url,
                public_id
            }
        }
    },{new:true}).populate("createdBy",["-password"])
    updatedPostImage?res.status(200).json({ message: "Done", updatedPostImage }):nxt(new Error(' fail to update post', { cause: 400 }))
    
}
/**--------------------------------
    * @desc Toggle Like 
    * @route    /api/post/like/:postId
    * @method   PUT
    * @access   Private (only loggedIn User )
-----------------------------------*/
const toggleLike=async (req,res,nxt)=>{
    const{postId}=req.params;
    const{_id}=req.user;
    // check if post exist
    let post=await postModel.findById(postId)
    if(!post)return nxt(new Error("in-valid post",{cause:400}))
    // check if user liked post before
    if(post?.likes?.includes(_id)){
        // pull like 
        post= await postModel.findByIdAndUpdate(postId,
            {
                $pull:{
                    likes:_id
                }
            },
            {
            new:true
            }
        )
        return res.json({message:"done remove like",post})
    }
    // push like 
    post=await postModel.findByIdAndUpdate(postId,
        {
            $push:{
                likes:_id
            }
        },
        {
        new:true
        }
    )
    res.json({message:"done add like",post})
}
export{
    createPost,
    getAllPosts,
    getSinglePost,
    getPostCount,
    deletePost,
    updatePost,
    updatePostImage,
    toggleLike
}