import joi from "joi";
import { generalFields } from "../../MiddleWares/validation.js";

export const createCategorySchema=joi.object({
    title:joi.string().required(),

}).required()

export const deleteCategorySchema=joi.object({
    categoryId:generalFields.id.messages({
        "string.length": "in-valid category Id"
    }).required()
}).required()

