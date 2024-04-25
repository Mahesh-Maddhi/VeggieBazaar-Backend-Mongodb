import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { authenticateUser } from "./auth.js";
import { router } from "./routes.js";

router.get("/cart", async (req, res) => {
  console.log("in-cart");
  const email = req.email || "test@gmail.com";
  console.log(email);
  try {
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItems = await Cart.findOne({ email: user.email });
    console.log("ci", cartItems);

    if (!cartItems || cartItems?.length === 0) {
      return res.status(404).json({ message: "Cart is empty", products: [] });
    }

    res.json(cartItems.items);
  } catch (error) {
    console.error(`Database query error: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/addToCart", async (req, res) => {
  const { email, productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ email: email });
    let productDetails = await Product.findOne({
      productId: req.body.productId,
    });
    const { productId, name, price, discounted_price, description, image } =
      productDetails;

    if (!cart) {
      cart = new Cart({
        email: email,
        items: [
          {
            productId,
            name,
            price,
            discounted_price,
            description,
            image,
            quantity,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex !== -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name,
          price,
          discounted_price,
          description,
          image,
          quantity,
        });
      }
    }

    await cart.save();

    res
      .status(200)
      .json({ message: `${productDetails?.name} added to cart successfully!` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding item to cart", error: error.message });
  }
});

router.delete("/deleteProductFromCart/:productId", async (req, res) => {
  const { productId } = req.params;
  const email = req.email || "test@gmail.com";

  try {
    let cart = await Cart.findOne({ email: email });

    if (!cart) {
      res.json({ message: "Item not found" });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex !== -1) {
        res.json({ message: "Item not found" });
      } else {
        const deletedItem = cart.items.splice(itemIndex, 1);
        await cart.save();

        res.status(200).json({
          message: `${deletedItem[0]?.name} removed from cart successfully`,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
});
