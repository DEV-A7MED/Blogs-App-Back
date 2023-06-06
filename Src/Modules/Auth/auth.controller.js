import userModel from "../../../DB/models/UserModel.js"
import bcrypt from 'bcryptjs'
import { generateToken } from "../../Utils/tokenMethods.js";
import { nanoid } from 'nanoid';

/**--------------------------------
    * @desc Sign up User
    * @route    /api/user/signUp
    * @method   POST
    * @access   Public
-----------------------------------*/
const signUp=async(req,res,nxt)=>{
    // destruct data
    const {userName,email,password}=req.body
    // check exist user
    const existUser=await userModel.findOne({email});
    if(existUser) return nxt(new Error("email already exist",{cause:409}));
    // password hashing
    const hashedPassword=bcrypt.hashSync(password,+process.env.SALT_ROUND)
    if(!hashedPassword)return nxt(new Error("fail to hash password",{cause:400}));
    // custom id for cloudinary upload photos
    const customId=nanoid(5)
    // TODO @send verification email to user 
    // create user
    const newUser=new userModel({
        userName,email,password:hashedPassword,customId
    })
    const user =newUser.save()
    // User Response
    user?res.status(201).json({message:"Registeration done,please log in",newUser}): nxt (new Error("fail to added user"),{cause:403});

}
/**--------------------------------
    * @desc LogIn User
    * @route    /api/user/logIn
    * @method   POST
    * @access   Public
-----------------------------------*/
const logIn=async(req,res,nxt)=>{
    // destruct data froom body
    const {email,password}=req.body
    // check user exist
// TODO @ask user to verify email or signup first 
    const existUser=await userModel.findOne({email});
    if(!existUser) return nxt(new Error("in-valid email or password",{cause:409}));

    // check correct password
    const matchedPassword=bcrypt.compareSync(password,existUser.password)
    if(!matchedPassword) return nxt(new Error("in-valid email or password",{cause:409}));

    // generate token
    const token =generateToken({
        payload:{
            _id:existUser._id,
            role:existUser.role,
            userName:existUser.userName,
            profilePhoto:existUser.profilePhoto

        }
    })
    // User Response
    return res.status(200).json({
        message:"done",
        token,
        _id:existUser._id,
        profilePhoto:existUser.profilePhoto,
        userName:existUser.userName,
        role:existUser.role
                        })

}
export{
    signUp,
    logIn
}