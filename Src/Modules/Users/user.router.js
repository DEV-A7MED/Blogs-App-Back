import { Router } from "express";
import auth from "../../MiddleWares/auth.js";
import * as userController from './user.controller.js'
import { endpoints } from "./user.endPoint.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
import { validation } from "../../MiddleWares/validation.js";
import { getUserProfileSchema, updateUserProfileSchema } from "./user.validation.js";
import { uploadPhoto } from "../../Utils/multer.js";

const router =Router()


// get all users profile (only admin)
router.get('/getUsersProfile',auth(endpoints.GET_ALL_USERS),asyncHandler(userController.getAllUsers))
// get user profile
router.get('/getUserProfile/:id',validation(getUserProfileSchema),asyncHandler(userController.getUserProfile))
// update user profile (only user himself)
router.put('/updateProfile/:id',auth(),validation(updateUserProfileSchema),asyncHandler(userController.updateUserProfile))
// Get users count (only admin)
router.get('/getUsersCount',auth(endpoints.GET_USERS_COUNT),asyncHandler(userController.getUsersCount))
// update user photo
router.put('/profile/update-profile-photo',auth(),uploadPhoto({}).single("image"),asyncHandler(userController.updateUserPhoto))
// delete user account 
router.delete('/profile/:userId',auth(),asyncHandler(userController.deletUserProfile))
export default router