import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import {v2 as cloudinary} from 'cloudinary';

import MyUserRoute from "./routes/MyUserRoute";
import MyRestaurantRoute from "./routes/MyRestaurantRoute";
import RestaurantRoute from "./routes/RestaurantRoute";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log(`Connected to database`);
    }).catch((err) => {
        console.log(`Error occured trying connecting to DB: `, err);
    })

          
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({message: 'Health is ok'});
})

app.use("/api/my/user", MyUserRoute);
app.use("/api/my/restaurant", MyRestaurantRoute);
app.use("/api/restaurant", RestaurantRoute);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server started on localhost:${PORT}`);
})