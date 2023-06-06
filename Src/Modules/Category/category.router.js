import { Router } from "express";
import auth from "../../MiddleWares/auth.js";
import { validation } from "../../MiddleWares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import * as controllers from './category.controller.js'
import { createCategorySchema, deleteCategorySchema } from "./category.validation.js";
import { endpoints } from "./category.endpoint.js";


const router=Router()
// create new category
router.post("/create-category",auth(endpoints.CREATE_CATEGORY),validation(createCategorySchema),asyncHandler(controllers.createCategory))

// get all categories
router.get("/",asyncHandler(controllers.getAllCategories))
// delete category 
router.delete("/:categoryId",auth(endpoints.DELETE_CATEGORY),validation(deleteCategorySchema),asyncHandler(controllers.deleteCategory))

export default router;