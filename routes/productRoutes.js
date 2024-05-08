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

router.get('/categories/:category', async (req, res) => {
	const { category = 'empty' } = req.params;
	try {
		const products = await Product.find({ category: category });
		res.json(products);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - category`,
		});
	}
});

router.get('/search', async (req, res) => {
	const { q } = req.query;

	try {
		const searchProductsQuery = {
			$or: [
				{ name: { $regex: q, $options: 'i' } },
				{ category: { $regex: q, $options: 'i' } },
				{ description: { $regex: q, $options: 'i' } },
			],
		};

		const productsArray = await Product.find(searchProductsQuery);

		res.json(productsArray);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - search`,
		});
	}
});
