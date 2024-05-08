import { router } from './routes.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateUser } from './auth.js';
dotenv.config();
import { ObjectId } from 'mongodb';
const isUser = async (email) => {
	const user = await User.findOne({ email });
	return user !== null;
};

router.get('/users', authenticateUser, async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

router.get('/userDetails', authenticateUser, async (req, res) => {
	const { email } = req.user;
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
			.json({ message: 'Email and password are required.' });
	}

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({ message: 'User does not exist.' });
		}

		const isPasswordMatched = await bcrypt.compare(password, user.password);

		if (!isPasswordMatched) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}

		const payload = {
			userId: user._id,
			email: user.email,
			username: user.fullName,
		};
		const jwtToken = jwt.sign(payload, process.env.SECRET_KEY, {
			expiresIn: '30d',
		});

		res.cookie('authToken', jwtToken, {
			httpOnly: true,
			maxAge: 30 * 24 * 60 * 60 * 1000,
			secure: true, // for production
			sameSite: 'None', //for production
		});
		res.cookie('isLoggedIn', true);

		return res.json({ message: 'Login successful.', token: jwtToken });
	} catch (error) {
		console.error(`Login error: ${error}`);
		return res.status(500).json({ message: 'An error occurred during login.' });
	}
});
router.post('/logout', (req, res) => {
	res.cookie('authToken', '', {
		maxAge: -1,
		path: '/',
		secure: true,
		sameSite: 'none',
	});
	res.cookie('isLoggedIn', false);
	return res.status(200).json({ message: 'Logged out successfully' });
});

router.post('/addAddress', authenticateUser, async (req, res) => {
	const { street, mandal, district, state, pincode, landMark } = req.body;
	const { email } = req.user;
	console.log('body :', req.body);
	console.log('user :', req.user);
	try {
		const user = await User.findOne({ email });
		console.log('db user :', user);
		if (user) {
			const address = {
				street,
				mandal,
				district,
				state,
				pincode,
				landMark,
			};
			user.addresses.push(address);
			await user.save();
			res.status(200).json({ message: 'Address added successfully.' });
		} else {
			res.status(400).send({ message: 'User not found' });
		}
	} catch (error) {
		console.log('error: ', error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

router.delete('/deleteAddress/:id', authenticateUser, async (req, res) => {
	const { email } = req.user;
	let { id } = req.params;
	id = new ObjectId(id);
	try {
		const user = await User.findOne({ email: email });
		// console.log('user', user);
		if (user) {
			// console.log('userAdd', user.addresses);
			const addressIndex = user.addresses.findIndex((address) => {
				// console.log(address);
				console.log(address._id, id);
				return id.toString() == address._id.toString();
			});
			if (addressIndex !== -1) {
				user.addresses.splice(addressIndex, 1);
				await user.save();
				res.status(200).json({ message: 'Address removed successfully.' });
			} else {
				res.status(400).json({ message: 'Address not found.' });
			}
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});
