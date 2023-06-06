import { Router } from "express";
import auth from "../../MiddleWares/auth.js";
import { validation } from "../../MiddleWares/validation.js";
import { UpdatePostImageSchema, UpdatePostSchema, createPostSchema, deletePostSchema, getSinglePostSchema, toggleLikeSchema } from "./post.validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import * as postControllers from './post.controller.js'
import { uploadPhoto } from "../../Utils/multer.js";

const router=Router()
// create new post
router.post("/create-post",auth(),uploadPhoto({}).single("image"),validation(createPostSchema),asyncHandler(postControllers.createPost))
// get all posts with features
router.get("/",asyncHandler(postControllers.getAllPosts))
// get posts count
router.get("/count",asyncHandler(postControllers.getPostCount))
// get single post
router.get("/:postId",validation(getSinglePostSchema),asyncHandler(postControllers.getSinglePost))
// delete post 
router.delete("/:postId",auth(),validation(deletePostSchema),asyncHandler(postControllers.deletePost))
// update post info
router.put("/update-post/:postId",auth(),validation(UpdatePostSchema),asyncHandler(postControllers.updatePost))
// update post image
router.put("/update-post-image/:postId",auth(),uploadPhoto({}).single("image"),validation(UpdatePostImageSchema),asyncHandler(postControllers.updatePostImage))
// toggle like
router.put("/like/:postId",auth(),validation(toggleLikeSchema),asyncHandler(postControllers.toggleLike))
export default router;