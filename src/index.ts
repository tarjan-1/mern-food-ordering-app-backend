import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

import MyUserRoute from "./routes/MyUserRoute";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log(`Connected to database`);
    }).catch((err) => {
        console.log(`Error occured trying connecting to DB: `, err);
    })

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req: Request, res: Response) => {
    res.json({message: 'Health is ok'});
})

app.use("/api/my/user", MyUserRoute);

app.listen(3000, () => {
    console.log(`Server started on localhost:3000`);
})