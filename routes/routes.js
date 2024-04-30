import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

router.get('/', (req, res) => {
	try {
		res.json({ message: 'successful' });
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - get`,
		});
	}
});

export { router };
