import express from "express";
import dotenv from "dotenv"
import router from "./routes";
import cors from "cors";


dotenv.config()

const app = express();

app.use(cors())
app.use(express.json());

app.use('/api', router);

const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})
