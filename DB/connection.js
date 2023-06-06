import mongoose from "mongoose";

const connectionDB= async ()=>{
    return await mongoose.connect(process.env.DB_CLOUD)
    .then(res=>console.log("DB Connected Successfully"))
    .catch(err=>console.log(`Fail To Connect DB...${err}`))
}
export default connectionDB;