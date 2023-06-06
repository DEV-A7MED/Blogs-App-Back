import jwt from 'jsonwebtoken'
export const generateToken=({payload={},signature=process.env.TOKEN_SIGNATURE,expiresIn = '15d' } = {})=>{
    const token=jwt.sign(payload,signature,{expiresIn})
    return token
}
export const decodeToken=({payload='',signature=process.env.TOKEN_SIGNATURE} = {})=>{
    const decode=jwt.verify(payload,signature)
    return decode
}