import { Router } from "express";
import * as authController from './auth.controller.js'
import * as validators from './auth.validation.js'
import { validation } from "../../MiddleWares/validation.js";
import { asyncHandler } from "../../Utils/errorHandling.js";
const router =Router()


// signUp router
router.post("/signUp",validation(validators.signUpSchema),asyncHandler(authController.signUp))
// verify account
router.get("/:userId/verify/:token",validation(validators.verifyAccountSchema),asyncHandler(authController.verifyEmail))
//LOGIN ROUTER
router.post("/logIn",validation(validators.logInSchema),asyncHandler(authController.logIn))
// Send reset password link
router.post("/reset-password",validation(validators.sendResetPassSchema),asyncHandler(authController.sendResetPassLink));
// get reset password link
router.get("/reset-password/:userId/:token",validation(validators.getResetPassSchema),asyncHandler(authController.getResetPassLink))
// reset password 
router.put("/reset-password/:userId/:token",validation(validators.resetPassSchema),asyncHandler(authController.resetPass))


export default router