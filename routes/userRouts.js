import { router } from './routes.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateUser } from './auth.js';
dotenv.config();
const isUser = async (email) => {
	const user = await User.findOne({ email });
	return user !== null;
};

router.get('/users', async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

router.get('/user/:email', async (req, res) => {
	const { email } = req.params;
	const user = await User.findOne({ email });
	res.json(user);
});

router.post('/addUser', async (req, res) => {
	const { email, password, fullName, mobile } = req.body;

	const isUserRegistered = await isUser(email);
	console.log('User exists:', isUserRegistered);

	if (isUserRegistered) {
		res.status(409).json({ message: 'User already registered.' });
	} else {
		try {
			const hashedPassword = await bcrypt.hash(
				password,
				parseInt(process.env.SALT_ROUNDS)
			);
			console.log('Hashed Password:', hashedPassword);

			const newUser = new User({
				email,
				password: hashedPassword,
				fullName,
				mobile,
			});
			console.log(newUser);

			await newUser.save(); // Save the user to the collection

			res.json({ message: `${fullName} registered successfully.` });
		} catch (error) {
			console.error('Error:', error.message);
			res
				.status(500)
				.json({ message: `Internal Server Error: ${error.message}` });
		}
	}
});

router.put('/updateUser', authenticateUser, async (req, res) => {
	const { email, password, full_name, mobile } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			return res.status(404).json({ message: 'User does not exist.' });
		}

		const updateFields = {};

		if (password !== undefined) {
			const hashedPassword = await bcrypt.hash(password, 10);
			updateFields.password = hashedPassword;
		}

		if (full_name !== undefined) {
			updateFields.full_name = full_name;
		}

		if (mobile !== undefined) {
			updateFields.mobile = mobile;
		}

		await User.updateOne({ email }, { $set: updateFields });

		return res.json({
			message: `User "${email}" details updated successfully.`,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: `Internal server error: ${error.message}` });
	}
});

router.delete('/deleteUser/:email', async (req, res) => {
	const { email } = req.params;

	if (!email) {
		return res.status(400).json({ message: 'Email is required' });
	}

	try {
		const deleteResult = await User.deleteOne({ email });

		if (deleteResult.deletedCount === 0) {
			return res
				.status(404)
				.json({ message: `User with email "${email}" does not exist` });
		}

		res
			.status(200)
			.json({ message: `User with email "${email}" removed successfully.` });
	} catch (error) {
		console.error('Delete User Error:', error);
		res
			.status(500)
			.json({ message: `Internal server error: ${error.message}` });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ message: 'Email and Password are required.' });
	}

	try {
		const user = await User.findOne({ email });

		if (user) {
			const isPasswordMatched = await bcrypt.compare(password, user.password);
			if (isPasswordMatched) {
				const payload = { username: user.fullName, email: user.email };
				const jwtToken = jwt.sign(payload, process.env.SECRET_KEY, {
					expiresIn: '30d',
				});

				res.json({ token: jwtToken, message: 'Login Successful' });
			} else {
				res.status(401).json({ message: 'Password Incorrect' });
			}
		} else {
			res.status(404).json({ message: 'User Does Not Exist' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error - login' });
	}
});
