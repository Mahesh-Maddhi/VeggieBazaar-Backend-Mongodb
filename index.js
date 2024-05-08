import express from 'express';
import dontenv from 'dotenv';
import cors from 'cors';
import { router } from './routes/routes.js';
import { connectToDatabase } from './config/database.js';
import cookieParser from 'cookie-parser';
import './routes/productRoutes.js';
import './routes/userRoutes.js';
import './routes/cartRoutes.js';
import './routes/contactRoutes.js';
import { authenticateUser } from './routes/auth.js';

dontenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectToDatabase();

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
	'https://veggiebazaar.vercel.app',
	'http://localhost:7200',
	'http://localhost:3000',
	'http://localhost:5000',
];

const corsOptions = {
	origin: (origin, callback) => {
		if (allowedOrigins.includes(origin) || !origin) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use('/', router);
app.use(authenticateUser);

export { router };
export default app;
