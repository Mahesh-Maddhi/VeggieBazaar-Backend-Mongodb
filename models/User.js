import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema({
	street: { type: String, required: true },
	mandal: { type: String, required: true },
	district: { type: String, required: true },
	pincode: { type: String, required: true },
	state: { type: String, required: true },
	landMark: { type: String },
});

const userSchema = new Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	mobile: { type: String, required: true },
	password: { type: String, required: true },
	addresses: [addressSchema],
	created_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema, 'user');

export default User;
