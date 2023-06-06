import joi from "joi";
import { generalFields } from "../../MiddleWares/validation.js";

export const createPostSchema=joi.object({
    title:joi.string().trim().min(2).max(20).required(),
    description:joi.string().trim().min(10).max(200).required(),
    category:joi.string().trim().required(),
    file:generalFields.file
}).required()
export const getSinglePostSchema=joi.object({
    postId:generalFields.id.messages({
        "string.length": "in-valid post id"
    })
}).required()
export const deletePostSchema=joi.object({
    postId:generalFields.id.messages({
        "string.length": "in-valid post id"
    })
}).required()
export const UpdatePostSchema=joi.object({
    title:joi.string().trim().min(2).max(20).optional(),
    description:joi.string().trim().min(10).max(200).optional(),
    category:joi.string().trim().optional(),
    postId:generalFields.id.required()
}).required()
export const UpdatePostImageSchema=joi.object({
    file:generalFields.file,
    postId:generalFields.id.required()
}).required()
export const toggleLikeSchema=joi.object({
    postId:generalFields.id.required()
}).required()