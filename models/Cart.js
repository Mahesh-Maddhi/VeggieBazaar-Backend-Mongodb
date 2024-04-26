import mongoose from 'mongoose';
import Product from './Product.js';

const { Schema } = mongoose;

const cartItemSchema = new Schema({
	productId: {
		type: Number,
		required: true,
		ref: 'Product',
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	price: {
		type: Number,
		required: true,
		min: 0,
	},
	discounted_price: {
		type: Number,
		default: 0,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	image: {
		type: String,
		required: true,
		trim: true,
	},
	quantity: { type: Number, default: 1 },
});

const cartSchema = new Schema({
	email: { type: String, ref: 'User', required: true },
	items: [cartItemSchema],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model('Cart', cartSchema, 'cart');

export default Cart;
