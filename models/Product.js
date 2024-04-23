import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema({
	productId: {
		type: Number,
		required: true,
		unique: true,
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
	rating: {
		type: Number,
		required: true,
		min: 0,
		max: 5,
	},
	stock: {
		type: Number,
		required: true,
		min: 0,
	},
	category: {
		type: String,
		required: true,
		trim: true,
	},
	image: {
		type: String,
		required: true,
		trim: true,
	},
});

const Product = mongoose.model('Product', productSchema, 'product');

export default Product;
