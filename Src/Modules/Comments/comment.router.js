import { Router } from "express";
import auth from "../../MiddleWares/auth.js";
import { validation } from "../../MiddleWares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import * as controllers from './comment.controller.js'
import { UpdateCommentSchema, createCommentSchema, deleteCommentSchema } from "./comment.validation.js";
import { endpoints } from "./comment.endpoint.js";


const router=Router()
// create new comment
router.post("/create-comment",auth(),validation(createCommentSchema),asyncHandler(controllers.createComment))

// get all comments
router.get("/",auth(endpoints.GET_ALL_COMMENTS),asyncHandler(controllers.getAllComments))
// delete coment 
router.delete("/:commentId",auth(),validation(deleteCommentSchema),asyncHandler(controllers.deleteComment))
// update comment
router.put("/update-comment/:commentId",auth(),validation(UpdateCommentSchema),asyncHandler(controllers.updateComment))
export default router;