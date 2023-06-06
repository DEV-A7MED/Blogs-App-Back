import joi from 'joi'
import { generalFields } from '../../MiddleWares/validation.js'
export const signUpSchema=joi.object({
    userName:joi.string().trim().min(2).max(50).required(),
    email:generalFields.email,
    password:generalFields.password,
    cpass:generalFields.cPassword
}).required()
export const logInSchema=joi.object({
    email:generalFields.email,
    password:generalFields.password
}).required()