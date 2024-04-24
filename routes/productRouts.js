import Product from '../models/Product.js';
import { productsData } from '../products.js';
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
	console.log('category', category);
	try {
		const products = await Product.find({ category: category });
		res.json(products);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - category`,
		});
	}
});

// router.get('/product/insert', async (req, res) => {
// 	console.log('insert');
// 	try {
// 		productsData.forEach(async (productData) => {
// 			const result = await Product.insertMany(productData);

// 			console.log(result);
// 		});
// 		res.json(result);
// 	} catch (error) {
// 		res.status(500).json({
// 			message: `Internal Server Error: ${error} - insertProducts`,
// 		});
// 	}
// });
