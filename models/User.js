import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	created_at: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema, 'user');

export default User;
