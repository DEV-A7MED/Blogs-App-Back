import connectionDB from "../../DB/connection.js"
import * as AllRouters from '../index.router.js'
import { globalResonseError } from "./errorHandling.js"
import cors from 'cors'

export const initApp=(app, express)=>{
    // running port
    const port = process.env.PORT||5000
    // buffering data
    app.use(express.json({}))
    // cors policy
    app.use(cors())
    // connect DB 
    connectionDB();

//Setup API Routing
app.use("/api/auth",AllRouters.authRouter)
app.use("/api/user",AllRouters.userRouter)
app.use("/api/post",AllRouters.postRouter)
app.use("/api/comment",AllRouters.commentRouter)
app.use("/api/category",AllRouters.categoryRouter)

// in-valid routings
app.all('*', (req, res, nxt) => {
    res.send("In-valid Routing Please check url  or  method")
})

// fail response
app.use(globalResonseError)
// server running
    app.listen(port, () => console.log(`Server Is Running On Port ${port}!!!`))
}