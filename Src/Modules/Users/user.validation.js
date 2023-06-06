import joi from 'joi'
import { generalFields } from '../../MiddleWares/validation.js'

export const getUserProfileSchema=joi.object({
    id:generalFields.id
}).required()
export const updateUserProfileSchema=joi.object({
    id:generalFields.id,
    password:generalFields.password.optional(),
    userName:joi.string().trim().min(2).max(50).optional(),
    bio:joi.string().min(2).max(50).optional(),
}).required()