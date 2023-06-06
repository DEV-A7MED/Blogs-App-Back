import userModel from "../../DB/models/UserModel.js";
import { systemRoles } from "../Utils/systemRoles.js";
import {decodeToken} from '../Utils/tokenMethods.js'
const auth = (accessRoles) => {
    return async (req, res, nxt) => {
        try {
            if (!accessRoles) {
                accessRoles = [systemRoles.USER, systemRoles.ADMIN]
            }
            const { authorization } = req.headers;
            if (!authorization) return nxt(new Error("please login first", { cause: 400 }))
            
            if (!authorization?.startsWith(process.env.BEARER_KEY)) return nxt(new Error("In-valid bearer key", { cause: 400 }))
            
            const token = authorization.split(process.env.BEARER_KEY)[1]
            if (!token) return nxt(new Error("In-valid token", { cause: 400 }))
            
            const decoded = decodeToken({ payload: token })
            if (!decoded?._id) return nxt(new Error("In-valid token payload", { cause: 400 }))

            const authUser = await userModel.findById(decoded._id).select('userName email role ')
            if (!authUser) return nxt(new Error("Not register account"), { cause: 400 })            
            // authorization 
            if (!accessRoles.includes(authUser.role)) return nxt(new Error("Un-Authorized User"), { cause: 400 })

            req.user = authUser;
            return nxt()
        } catch (error) {
            return res.json({ message: "Catch error", err: error?.message })
        }
    }
}
export default auth;