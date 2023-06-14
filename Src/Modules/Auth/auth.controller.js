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
    const user =newUser.save()
//send verification email to user 
    // generate token
    const token =generateToken({
        payload:{
            _id:newUser._id,
            role:newUser.role,
            userName:newUser.userName,
            profilePhoto:newUser.profilePhoto

        }
    },
    {expiresIn:'1h'}
    )
    // verify link
    const verifyLink=`${req.protocol}://${req.headers.host}/user/${newUser._id}/verify/${token}`;
    // verify email
    const verifyEmail=await sendEmail({
        to: email,
        subject: "confirmation email",
        message: `<a href=${verifyLink}>Click to confirm</a>`
    })
    if(!verifyEmail)return nxt (new Error("fail to send email"))
    // User Response
    user?res.status(201).json({message:"Registeration done,please verify your account",newUser}): nxt (new Error("fail to added user"),{cause:403});

}
/**--------------------------------
    * @desc     verify user
    * @route    /api/auth/:id/verify/:token
    * @method   GET
    * @access   Public
-----------------------------------*/
const verifyEmail=async(req,res,nxt)=>{
    const{token}=req.params;
    const decode = decodeToken({ payload: token });
    if (!decode?._id) return nxt(new Error("in-valid token",{cause:400}))
   
    const verifiedUser=await userModel.findOneAndUpdate({_id:decode._id,isConfirmed:false},{isConfirmed:true})
    if(!verifiedUser) return nxt(new Error("You Are Already Confirmed",{cause:400}))
    
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
        const verifyToken =generateToken({
            payload:{
                _id:user._id,
                role:user.role,
                userName:user.userName,
                profilePhoto:user.profilePhoto
    
            }
        },
        {expiresIn:'1h'}
        )
        // verify link
        const verifyLink=`${req.protocol}://${req.headers.host}/user/${user._id}/verify/${verifyToken}`;
        // verify email
        await sendEmail({
            to:user.email,
            subject: "confirmation email",
            message: `<a href=${verifyLink}>Click to confirm</a>`
        })
        return res.status(200).json({ message: "check your email and verify your account" });
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