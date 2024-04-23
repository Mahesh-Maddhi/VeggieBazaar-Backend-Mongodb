import Product from '../models/Product.js';
import { router } from './routes.js';

router.get('/products', async (req, res) => {
	try {
		const products = await Product.find({});
		res.json(products);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error: ${error.message} - getProducts`,
		});
	}
});
router.get('/products/:productId', async (req, res) => {
	const { productId } = req.params;
	try {
		const product = await Product.findOne({ productId });
		res.json(product);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error: ${error.message} - getProducts`,
		});
	}
});
