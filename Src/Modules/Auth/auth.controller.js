import userModel from "../../../DB/models/UserModel.js"
import bcrypt from 'bcryptjs'
import { decodeToken, generateToken } from "../../Utils/tokenMethods.js";
import { nanoid } from 'nanoid';
import { sendEmail } from "../../Utils/sendEmail.js";

/**--------------------------------
    * @desc Sign up User
    * @route    /api/auth/signUp
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
    // create user
    const newUser=new userModel({
        userName,email,password:hashedPassword,customId
    })
//send verification email to user 
    // generate token
    const token =generateToken({
        payload:{
            userId:newUser._id,
        },
        expiresIn:'1h'
    }
    );

    // verify link
    const verifyLink=`http://localhost:3000/Blogs-App-Front#/user/${newUser._id}/verify/${token}`;
    // verify email
    const verifyEmail=await sendEmail({
        to: email,
        subject: "confirmation email",
        message: `<a href=${verifyLink}>Click to confirm</a>`
    });
    if(!verifyEmail)return nxt (new Error("fail to send email"));

    const user =await newUser.save();
    // User Response
    user?res.status(201).json({message:"Registeration done,please verify your account"}): nxt (new Error("fail to added user"),{cause:403});

}
/**--------------------------------
    * @desc     verify user
    * @route    /api/auth/:id/verify/:token
    * @method   GET
    * @access   Public
-----------------------------------*/
const verifyEmail=async(req,res,nxt)=>{
    const{userId,token}=req.params;

    const decode = decodeToken({ payload: token });
    if (!decode?.userId) return nxt(new Error("in-valid token",{cause:400}))
    const user=await userModel.findOne({_id:userId,isConfirmed:false})
    if(!user) return nxt(new Error("You Are Already Confirmed",{cause:400}))
    user.isConfirmed=true;
    await user.save();
    
    return res.status(200).json({ message: "Confirmation success , please try to login" });
    
}
/**--------------------------------
    * @desc LogIn User
    * @route    /api/auth/logIn
    * @method   POST
    * @access   Public
-----------------------------------*/
const logIn=async(req,res,nxt)=>{
    // destruct data froom body
    const {email,password}=req.body
    // ask user to verify email or signup first 
    const verifiedUser=await userModel.findOne({email,isConfirmed:true});

    if(!verifiedUser) {
        const user=await userModel.findOne({email});
        if(!user) return nxt(new Error("in-valid email or password",{cause:409}));
        // generate new verification link
        const token =generateToken({
            payload:{
                userId:user._id,
            },
            expiresIn:'1h'
        }
        )
        // verify link
        const verifyLink=`http://localhost:3000/Blogs-App-Front#/user/${user._id}/verify/${token}`;
        // verify email
        await sendEmail({
            to:user.email,
            subject: "confirmation email",
            message: `<a href=${verifyLink}>Click to confirm</a>`
        })
        return nxt(new Error("check your email and verify your account",{cause:400}))
    }
    // check user exist
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
    logIn,
    verifyEmail
}