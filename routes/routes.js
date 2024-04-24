import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function authenticateUser(req, res, next) {
	let jwtToken = req.headers['authorization']; // only taking token from " BEARER 'token' "
	if (jwtToken) {
		jwtToken = jwtToken.split(' ')[1];
	}
	try {
		if (!jwtToken) {
			return res.status(403).json({
				message: 'Token is required',
				warning: 'You are Not Authorized to Access This Content',
			});
		}

		// verifying jwt token
		let decoded = jwt.verify(jwtToken, process.env.SECRET_KEY);
		req.username = decoded.username;
		req.email = decoded.email;
		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token' });
		}
		res
			.status(500)
			.json({ message: 'Internal Server Error - authenticateUser' });
	}
}

router.get('/', (req, res) => {
	try {
		res.json({ message: 'successful' });
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - get`,
		});
	}
});
router.get('/search', async (req, res) => {
	const { q } = req.query;
	const searchProductsQuery = `SELECT * FROM products WHERE name LIKE '%${q}%'
   OR description LIKE '%${q}%' ;`;
	try {
		let productsArray = await db.all(searchProductsQuery);
		res.json({ products: productsArray });
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - search`,
		});
	}
});

router.get('/cart', authenticateUser, async (req, res) => {
	console.log('in-cart');
	const email = req.email;
	try {
		const data = await db.all(
			`SELECT * FROM cart INNER JOIN products ON cart.product_id = products.id WHERE email LIKE "${email}"`
		);
		res.json(data);
	} catch (error) {
		console.error(`Database query error: ${error.message}`);
		res.status(500).json({ message: 'Internal Server Error' });
	}
});

router.post('/addProductToCart', authenticateUser, async (req, res) => {
	let { productId, quantity } = req.body;
	const email = req.email;

	console.log('in add-to-cart', productId, email, quantity);

	try {
		const getProductIdQuery = `SELECT * FROM cart INNER JOIN users ON cart.email = users.email WHERE cart.product_id = ${productId} AND users.email LIKE "${email}";`;
		let cartProduct = await db.get(getProductIdQuery);
		console.log('cart-product', cartProduct);

		if (cartProduct === undefined) {
			let addProductToCartQuery = `INSERT INTO 
                cart("email", "product_id", "quantity")
                values("${email}", ${productId}, ${quantity});`;
			try {
				await db.run(addProductToCartQuery);
				res.json({
					message: `Item added to cart successfully.`,
				});
			} catch (error) {
				console.log(error);
				res.status(500).json({
					message: `Internal server error - add to cart : ${error.message}`,
				});
			}
		} else {
			let updateProductToCartQuery = `UPDATE cart
                SET quantity =  ${quantity}
                 WHERE email LIKE "${email}" 
                 AND product_id = ${productId};`;
			try {
				await db.run(updateProductToCartQuery);
				res.json({
					message: `${cartProduct.name} quantity updated to ${quantity}.`,
				});
			} catch (error) {
				res
					.status(500)
					.json({ message: `Internal server error : ${error.message}` });
			}
		}
	} catch (error) {
		res.status(500).json({
			message: `Internal server error -add to cart : ${error.message}`,
		});
	}
});
router.delete(
	'/deleteProductFromCart/:productId',
	authenticateUser,
	async (req, res) => {
		const { productId } = req.params;
		const email = req.email;

		try {
			const getProductIdQuery = `SELECT * FROM cart 
        WHERE product_id = ${productId} 
        AND email LIKE "${email}";`;
			let cartProduct = await db.get(getProductIdQuery);

			if (cartProduct === undefined) {
				res.status(404).json({ message: `product not found in cart` });
			} else {
				let deleteProductFromCartQuery = `DELETE FROM cart
                WHERE email LIKE "${email}" 
                AND product_id = ${productId};`;
				try {
					await db.run(deleteProductFromCartQuery);
					res.json({
						message: `Item removed from cart Successfully.`,
					});
				} catch (error) {
					res
						.status(500)
						.json({ message: `Internal server error : ${error.message}` });
				}
			}
		} catch (error) {
			res
				.status(500)
				.json({ message: `Internal server error : ${error.message}` });
		}
	}
);

export { router };
