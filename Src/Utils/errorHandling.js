
let stackVar;
const asyncHandler=(API)=>{
    return (req,res,nxt)=>{
        API(req,res,nxt).catch(err=>{
            stackVar=err.stack
            nxt(new Error(err.message));
        })
    }
}
const globalResonseError=(err,req,res,nxt)=>{
    if(err){
        if(process.env.ENV_MOD==='development')return res.status(err["cause"] || 500).json({
            Message: "fail response",
            Error: err.message,
            stack: stackVar,
            });
        return res.status(err["cause"] || 500).json({
            Message: "fail response",
            Error: err.message,
            });
    }
}
export{
    asyncHandler,globalResonseError
}