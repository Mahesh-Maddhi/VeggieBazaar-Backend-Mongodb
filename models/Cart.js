import mongoose from "mongoose";
import Product from './Product.js' 

// Define the schema for the CartItem
const cartItemSchema = new mongoose.Schema({
    ...Product,
    quantity: { type: Number, default: 1 },
});

// Define the schema for the Cart
const cartSchema = new mongoose.Schema({
    email: { type: String, ref: 'User', required: true },
    items: [cartItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Cart = mongoose.model('Cart', cartSchema, 'cart');

module.exports = Cart;
