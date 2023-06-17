import joi from 'joi'
import { generalFields } from '../../MiddleWares/validation.js'
// signup validation schema
export const signUpSchema=joi.object({
    userName:joi.string().trim().min(2).max(50).required(),
    email:generalFields.email,
    password:generalFields.password,
    cpass:generalFields.cPassword
}).required()
// verify account schema
export const verifyAccountSchema=joi.object({
    userId:generalFields.id,
    token:joi.string().required(),
}).required()
// login schema
export const logInSchema=joi.object({
    email:generalFields.email,
    password:generalFields.password
}).required()
// send reset password schema
export const sendResetPassSchema=joi.object({
    email:generalFields.email,

}).required()
// get reset pass schema
export const getResetPassSchema=joi.object({
    userId:generalFields.id,
    token:joi.string().required(),

}).required()
// set new password schema
export const resetPassSchema=joi.object({
    password:generalFields.password,
    userId:generalFields.id,
    token:joi.string().required(),

}).required()