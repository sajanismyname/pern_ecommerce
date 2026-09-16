import { AppDataSource } from "../config/dataSource.js";
import { CartItem } from "../entities/cart.js";
import { Product } from "../entities/product.js";

const cartRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);


// GET CART
export const getCart = async (req, res) => {
  try {
    const items = await cartRepository.find({
      where: {
        user: {
          id: req.user.id,
        },
      },
      relations: {
        product: true,
      },
      order: {
        created_at: "DESC",
      },
    });

    const formattedItems = items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image_url: item.product.image_url,
      stock: item.product.stock,
    }));

    const total = formattedItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    res.json({
      items: formattedItems,
      total: Number(total.toFixed(2)),
    });

  } catch (err) {
    console.error("GetCart error:", err);

    res.status(500).json({
      message: "Could not fetch cart.",
    });
  }
};


// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await productRepository.findOne({
      where: {
        id: Number(productId),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available.",
      });
    }

    let cartItem = await cartRepository.findOne({
      where: {
        user: {
          id: req.user.id,
        },
        product: {
          id: Number(productId),
        },
      },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = cartRepository.create({
        user: {
          id: req.user.id,
        },
        product: {
          id: Number(productId),
        },
        quantity,
      });
    }

    const savedItem = await cartRepository.save(cartItem);

    res.status(201).json({
      item: {
        id: savedItem.id,
        product_id: Number(productId),
        quantity: savedItem.quantity,
      },
    });

  } catch (err) {
    console.error("AddToCart error:", err);

    res.status(500).json({
      message: "Could not add item to cart.",
    });
  }
};


// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await cartRepository.findOne({
      where: {
        id: Number(id),
        user: {
          id: req.user.id,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    cartItem.quantity = quantity;

    const updatedItem = await cartRepository.save(cartItem);

    res.json({
      item: {
        id: updatedItem.id,
        product_id: updatedItem.product.id,
        quantity: updatedItem.quantity,
      },
    });

  } catch (err) {
    console.error("UpdateCartItem error:", err);

    res.status(500).json({
      message: "Could not update cart item.",
    });
  }
};


// REMOVE CART ITEM
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await cartRepository.findOne({
      where: {
        id: Number(id),
        user: {
          id: req.user.id,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    await cartRepository.remove(cartItem);

    res.json({
      message: "Item removed from cart.",
      id: Number(id),
    });

  } catch (err) {
    console.error("RemoveCartItem error:", err);

    res.status(500).json({
      message: "Could not remove cart item.",
    });
  }
};