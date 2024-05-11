import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();

export async function authenticateUser(req, res, next) {
	let jwtToken = req.cookies['authToken'];
	console.log('jwtToken', jwtToken);

	if (!jwtToken) {
		return res.status(403).json({
			message: 'Token is required',
			warning: 'You are Not Authorized to Access This Content',
		});
	}

	let decoded;
	try {
		decoded = jwt.verify(jwtToken, process.env.SECRET_KEY);
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token' });
		}
		return res
			.status(500)
			.json({ message: 'Internal Server Error - authenticateUser' });
	}

	try {
		const user = await User.findOne({
			email: decoded.email,
		});

		if (user) {
			req.user = user;
			next();
		} else {
			res.status(401).json({
				message: 'Unauthorized - User not found',
				warning: 'You are Not Authorized to Access This Content',
			});
		}
	} catch (err) {
		res.status(500).json({
			message: 'Internal Server Error - Database Error',
			error: err.message,
		});
	}
}
