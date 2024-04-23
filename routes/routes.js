import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
configDotenv.apply();

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
async function isUser(email) {
	let isUserRegisteredQuery = `SELECT * FROM users
                WHERE email LIKE "${email}" `;
	let isUserRegistered = await db.get(isUserRegisteredQuery);
	return isUserRegistered ? true : false;
}

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res
			.status(400)
			.json({ message: 'Email and Password are required.' });
	}
	try {
		let user = await db.get(
			`SELECT * FROM users WHERE email LIKE "${email}" ;`
		);
		console.log('db-user', user);
		if (user) {
			let isPasswordMatched = await bcrypt.compare(password, user.password);
			if (isPasswordMatched) {
				// generating JWT Token
				let payload = { username: user.full_name, email: user.email };
				const jwtToken = jwt.sign(payload, process.env.SECRET_KEY, {
					expiresIn: '30d',
				});

				res.json({ token: jwtToken, message: 'login Successful' });
			} else {
				res.json({ message: 'Password Incorrect' });
			}
		} else {
			res.status(400).json({ message: 'User Does not Exist' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Internal Server Error - login' });
	}
});
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
router.get('/categories/:category', async (req, res) => {
	const { category = 'empty' } = req.params;
	console.log('category', category);
	try {
		let getProductsQuery = `SELECT * FROM products WHERE category LIKE "${category}";`;
		let productsJson = await db.all(getProductsQuery);
		res.json(productsJson);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - category`,
		});
	}
});
router.get('/products', async (req, res) => {
	try {
		let getProductsQuery = `SELECT * FROM products;`;
		let productsJson = await db.all(getProductsQuery);
		res.json(productsJson);
	} catch (error) {
		res.status(500).json({
			message: `Internal Server Error ${error.message} - getproducts`,
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
router.get('/users', async (req, res) => {
	try {
		const data = await db.all('SELECT * FROM users;');
		res.json(data);
	} catch (error) {
		console.error(`Database query error: ${error.message}`);
		resstatus(500).json({ message: `Internal Server Error ${error.message}` });
	}
});
router.post('/addUser', async (req, res) => {
	let { email, password, fullName, mobile } = req.body;

	let isUserRegistered = await isUser(email);
	console.log(isUserRegistered);
	if (isUserRegistered) {
		res.status(409).json({ message: 'User already registered.' });
	} else {
		let hashedPassword = await bcrypt.hash(
			password,
			parseInt(process.env.SALT_ROUNDS)
		);
		console.log('hashed: ', hashedPassword);
		try {
			let addUserQuery = `INSERT INTO 
            users("email", "password", "full_name", "mobile")
            values("${email}", "${hashedPassword}", "${fullName}", "${mobile}");`;
			await db.run(addUserQuery);
			res.json({ message: `${fullName} Registered successfully.` });
		} catch (error) {
			res
				.status(500)
				.json({ message: `Internal Server Error ${error.message}` });
		}
	}
});
router.delete('/deleteUser', authenticateUser, async (req, res) => {
	let { email } = req.body;

	let isUserRegistered = await isUser(email);
	if (!isUserRegistered) {
		res.json({ message: `User doest not Exist` });
	} else {
		try {
			let deleteUserQuery = `DELETE FROM  users
                    WHERE email LIKE "${email}" ;`;
			await db.run(deleteUserQuery);
			res.json(`User : "${email}" removed successfully.`);
		} catch (error) {
			res.status(500).json(`Internal server error : ${error.message}`);
		}
	}
});
router.put('/updateUser', authenticateUser, async (req, res) => {
	let { email, password, full_name, mobile } = req.body;

	let isUserRegistered = await isUser(email);
	if (!isUserRegistered) {
		res.json({ message: 'User does not exist.' });
	} else {
		try {
			let isFirst = true;
			let updateUserQuery = `UPDATE users SET  `;
			if (password !== undefined) {
				if (isFirst) {
					updateUserQuery += ``;
					isFirst = false;
				} else {
					updateUserQuery += `, `;
				}
				updateUserQuery += `password = "${password}"`;
			}
			if (full_name !== undefined) {
				if (isFirst) {
					updateUserQuery += ``;
					isFirst = false;
				} else {
					updateUserQuery += `, `;
				}
				updateUserQuery += `full_name = "${full_name}"`;
			}
			if (mobile !== undefined) {
				if (isFirst) {
					updateUserQuery += ``;
					isFirst = false;
				} else {
					updateUserQuery += `, `;
				}
				updateUserQuery += `mobile = "${mobile}"`;
			}
			updateUserQuery += ` WHERE email LIKE "${email}" ;`;

			await db.run(updateUserQuery);
			res.json({ message: `User : "${email}" details updated successfully.` });
		} catch (error) {
			res
				.status(500)
				.json({ messgae: `Internal server error : ${error.message}` });
		}
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

router.get('/products/:productId', async (req, res) => {
	try {
		let { productId } = req.params;

		let getProductsQuery = `SELECT * FROM products
        WHERE id = ${productId} ;`;
		let productDetails = await db.get(getProductsQuery);
		res.json(productDetails);
	} catch (error) {
		res
			.status(500)
			.json({ message: `Internal Server Error :${error.message}` });
	}
});

export { router };
