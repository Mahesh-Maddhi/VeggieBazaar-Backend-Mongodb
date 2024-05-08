import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { router } from './routes/routes.js';
import { connectToDatabase } from './config/database.js';
import cookieParser from 'cookie-parser';
import './routes/productRoutes.js';
import './routes/userRoutes.js';
import './routes/cartRoutes.js';
import './routes/contactRoutes.js';
import { authenticateUser } from './routes/auth.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectToDatabase();

app.use(express.json());
app.use(cookieParser());

// const corsOptions = {
// 	origin: [
// 		'https://veggiebazaar.vercel.app',
// 		'http://localhost:7200',
// 		'http://localhost:3000',
// 		'http://localhost:5000',
// 	],
// 	credentials: true,
// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
// 	allowedHeaders: ['Content-Type', 'Authorization'],
// };

const allowedOrigins = [
	'https://veggiebazaar.vercel.app',
	'http://localhost:7200',
	'http://localhost:3000',
	'http://localhost:5000',
	'https://veggie-bazaar-backend-mongodb.vercel.app',
];
// app.options('*', cors(corsOptions));
const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests from allowed origins
		if (allowedOrigins.includes(origin) || !origin) {
			callback(null, true);
		} else {
			// If the origin is not allowed, deny the request
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true, // Enable cookies and other credentials in cross-origin requests
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
	allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use('/', router);
app.use(authenticateUser);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

export { router };
export default app;
