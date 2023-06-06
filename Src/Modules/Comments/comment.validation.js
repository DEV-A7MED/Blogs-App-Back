import joi from "joi";
import { generalFields } from "../../MiddleWares/validation.js";

export const createCommentSchema=joi.object({
    text:joi.string().required(),
    postId:generalFields.id.required(),

}).required()

export const deleteCommentSchema=joi.object({
    commentId:generalFields.id.messages({
        "string.length": "in-valid comment id"
    }).required()
}).required()
export const UpdateCommentSchema=joi.object({
    text:joi.string().optional(),
    commentId:generalFields.id.messages({
        "string.length": "in-valid comment id"
    }).required()
}).required()
