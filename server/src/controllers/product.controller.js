import { AppDataSource } from "../config/dataSource.js";
import { Product } from "../entities/product.js";
import { getIO } from "../socket.js";
import { getIO } from "../socket.js";

export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    const productRepository =
      AppDataSource.getRepository(Product);

    const query = productRepository
      .createQueryBuilder("product")
      .select([
        "product.id",
        "product.name",
        "product.description",
        "product.price",
        "product.stock",
        "product.image_url",
        "product.category",
        "product.created_at",
      ])
      .orderBy("product.created_at", "DESC");

    if (category) {
      query.andWhere(
        "product.category = :category",
        { category }
      );
    }

    if (search) {
      query.andWhere(
        "product.name ILIKE :search",
        { search: `%${search}%` }
      );
    }

    const products = await query.getMany();

    res.json({ products });

  } catch (err) {
    console.error("GetProducts error:", err);

    res.status(500).json({
      message: "Could not fetch products.",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productRepository =
      AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: {
        id: Number(id),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({ product });

  } catch (err) {
    console.error("GetProductById error:", err);

    res.status(500).json({
      message: "Could not fetch product.",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;

    const productRepository = AppDataSource.getRepository(Product)

    const product = productRepository.create({
      name,
      description: description || null,
      price,
      stock,
      image_url: imageUrl || null,
      category: category || null,
      created_by: req.user.id,
    })

    const savedProduct =
      await productRepository.save(product);

    rres.status(201).json({
      product: savedProduct,
    });
  } catch (err) {
    console.error("CreateProduct error:", err);

    res.status(500).json({
      message: "Could not create product.",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const productRepository =
      AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: {
        id: Number(id),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const columnMap = {
      name: "name",
      description: "description",
      price: "price",
      stock: "stock",
      imageUrl: "image_url",
      category: "category",
    };

    let hasValidField = false;

    for (const [key, value] of Object.entries(fields)) {
      const column = columnMap[key];

      if (!column) continue;

      product[column] = value === "" ? null : value;

      hasValidField = true;
    }

    if (!hasValidField) {
      return res.status(400).json({
        message: "No valid fields to update.",
      });
    }

    product.updated_at = new Date();

    const updatedProduct =
      await productRepository.save(product);

    // Socket.IO
    const io = getIO();

    io.emit("updated_product", updatedProduct);

    res.json({
      product: updatedProduct,
    });

  } catch (err) {
    console.error("UpdateProduct error:", err);

    res.status(500).json({
      message: "Could not update product.",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productRepository =
      AppDataSource.getRepository(Product);

    const product = await productRepository.findOne({
      where: {
        id: Number(id),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    await productRepository.remove(product);

    res.json({
      message: "Product deleted successfully.",
      id: product.id,
    });

  } catch (err) {
    console.error("DeleteProduct error:", err);

    res.status(500).json({
      message: "Could not delete product.",
    });
  }
};
