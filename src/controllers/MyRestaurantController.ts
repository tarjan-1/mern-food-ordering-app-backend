import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from 'cloudinary';
import mongoose from "mongoose";
import Order from "../models/order";

const updateMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if(!restaurant){
            return res.status(404).json({message: "Restaurant not found"});
        }

        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();

        if(req.file){
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            restaurant.imageUrl = imageUrl;
        }

        await restaurant.save();
        res.status(200).send(restaurant);
        
    } catch (error) {
        console.log("error in updateRestaurant controller ", error);
        res.status(500).json({message: "Error updating restaurant"});
    }
}

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if(!restaurant){
            return res.status(404).json({message: "Restaurant not found"});
        }

        res.status(200).json(restaurant);
        
    } catch (error) {
        console.log("Error in getMyRestaurant controller ", error);
        res.status(500).json({message: "Error fetching restaurant"});
    }
}

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({user: req.userId});
        if(existingRestaurant){
            return res.status(409).json({message: "User restaurant already exists"})
        }

        const imageUrl = await uploadImage(req.file as Express.Multer.File);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = imageUrl;
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdated = new Date();

        await restaurant.save();
        res.status(201).json(restaurant);
        
    } catch (error) {
        console.log(`error in createMyRestaurant controller `, error);
        res.status(500).json({message: "Something went wrong"});
    }
}

const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });

        if(!restaurant){
            return res.status(404).json({ message: "restaurant not found" });
        }

        const orders = await Order.find({ user: req.userId }).populate("restaurant").populate("user");

        res.json(orders);
        
    } catch (error) {
        console.log("Error in getMyRestaurantOrders controller: ", error);
        res.status(500).json({ message: "something went wrong" });
    }
}

const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if(!order){
            return res.status(404).json({ messsage: "order not found" });
        }

        const restaurant = await Restaurant.findById(order.restaurant);
        
        if(restaurant?.user?._id.toString() !== req.userId){
            return res.status(401).send();
        }

        order.status = status;
        await order.save();

        res.status(200).json(order);
        
    } catch (error) {
        console.log("Error in updateOrderStatus controller: ", error);
        res.status(500).json({ message: "unable to update order status" });
    }
}

const uploadImage = async (file: Express.Multer.File) => {
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
}

export default {
    updateOrderStatus,
    getMyRestaurantOrders,
    createMyRestaurant,
    getMyRestaurant,
    updateMyRestaurant
}