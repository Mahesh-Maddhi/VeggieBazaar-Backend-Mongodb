import express from 'express';
import dontenv from 'dotenv';
import cors from 'cors';
import { router } from './routes/routes.js';
import { connectToDatabase } from './config/database.js';
import './routes/productRouts.js';
import './routes/userRouts.js';

dontenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectToDatabase().catch((error) => {
	console.error('Database connection error:', error);
	process.exit(1);
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

app.use(express.json());
app.use(cors());
app.use('/', router);

export { router };
export default app;
