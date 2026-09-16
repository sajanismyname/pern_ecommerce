import { AppDataSource } from "../config/dataSource.js";
import { getIO } from "../socket.js";
import crypto from "crypto";

import { Order } from "../entities/order.js";
import { OrderItem } from "../entities/orderItem.js";
import { CartItem } from "../entities/cart.js";
import { Product } from "../entities/product.js";

export const createOrder = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { paymentMethod } = req.body;

        const allowedMethods = [
        "Dummy eSewa",
        "Dummy Khalti",
        "Cash on Delivery",
        ];

        if (!allowedMethods.includes(paymentMethod)) {
        await queryRunner.rollbackTransaction();

        return res.status(400).json({
            message: "Invalid payment method.",
        });
        }

        // Get user's cart
        const items = await queryRunner.manager.find(CartItem, {
        where: {
            user: {
            id: req.user.id,
            },
        },
        relations: {
            product: true,
        },
        });

        if (items.length === 0) {
        await queryRunner.rollbackTransaction();

        return res.status(400).json({
            message: "Your cart is empty.",
        });
        }

        // Check stock
        for (const item of items) {
        if (item.quantity > item.product.stock) {
            await queryRunner.rollbackTransaction();

            return res.status(400).json({
            message: `${item.product.name} does not have enough stock.`,
            });
        }
        }

        // Calculate total
        const total = items.reduce(
        (sum, item) =>
            sum + Number(item.product.price) * item.quantity,
        0
        );

        // Generate order number
        const orderNumber = `ORD-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

        // Create Order entity
        const order = queryRunner.manager.create(Order, {
        order_number: orderNumber,

        user: {
            id: req.user.id,
        },

        total: total.toFixed(2),

        payment_method: paymentMethod,

        payment_status:
            paymentMethod === "Cash on Delivery"
            ? "pending"
            : "paid",

        order_status: "pending",
        });

        // Save order
        const savedOrder = await queryRunner.manager.save(Order, order);

        // Create order items + reduce stock
        for (const item of items) {
        const orderItem = queryRunner.manager.create(OrderItem, {
            order: {
            id: savedOrder.id,
            },

            product: {
            id: item.product.id,
            },

            quantity: item.quantity,

            price: item.product.price,
        });

        await queryRunner.manager.save(OrderItem, orderItem);

        // Reduce product stock
        item.product.stock -= item.quantity;

        await queryRunner.manager.save(Product, item.product);
        }

        // Clear cart
        await queryRunner.manager.delete(CartItem, {
        user: {
            id: req.user.id,
        },
        });

        // Commit transaction
        await queryRunner.commitTransaction();

        // Socket.IO
        const io = getIO();

        for (const item of items) {
        const updatedProduct = await productRepository.findOne({
            where: {
            id: item.product.id,
            },
        });

        if (updatedProduct) {
            io.emit("updated_product", updatedProduct);
        }
        }

        res.status(201).json({
        message: "Order created successfully.",
        order: savedOrder,
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();

        console.error("CreateOrder error:", error);

        res.status(500).json({
        message: "Could not create order.",
        });

    } finally {
        await queryRunner.release();
    }
};

// USER: Get own orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await orderRepository.find({
        where: {
            user: {
            id: req.user.id,
            },
        },

        relations: {
            items: {
            product: true,
            },
        },

        order: {
            created_at: "DESC",
        },
        });

        const formattedOrders = orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: order.created_at,

        items: order.items.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            image_url: item.product.image_url,
        })),
        }));

        res.json({
        orders: formattedOrders,
        });

    } catch (error) {
        console.error("GetMyOrders error:", error);

        res.status(500).json({
        message: "Could not fetch your orders.",
        });
    }
};

// ADMIN: Get all orders
export const getAdminOrders = async (req, res) => {
    try {
        const orders = await orderRepository.find({
        relations: {
            user: true,

            items: {
            product: true,
            },
        },

        order: {
            created_at: "DESC",
        },
        });

        const formattedOrders = orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        user_id: order.user.id,
        total: order.total,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: order.created_at,

        customer_name: order.user.name,
        customer_email: order.user.email,

        items: order.items.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            image_url: item.product.image_url,
        })),
        }));

        res.json({
        orders: formattedOrders,
        });

    } catch (error) {
        console.error("GetAdminOrders error:", error);

        res.status(500).json({
        message: "Could not fetch orders.",
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const { payment_status, order_status } = req.body;

        // -----------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------

        if (
        payment_status === undefined &&
        order_status === undefined
        ) {
        await queryRunner.rollbackTransaction();

        return res.status(400).json({
            message: "Payment status or order status is required.",
        });
        }

        const allowedPaymentStatuses = [
        "pending",
        "paid",
        "failed",
        "refunded",
        ];

        if (
        payment_status !== undefined &&
        !allowedPaymentStatuses.includes(payment_status)
        ) {
        await queryRunner.rollbackTransaction();

        return res.status(400).json({
            message: "Invalid payment status.",
        });
        }

        const allowedOrderStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        ];

        if (
        order_status !== undefined &&
        !allowedOrderStatuses.includes(order_status)
        ) {
        await queryRunner.rollbackTransaction();

        return res.status(400).json({
            message: "Invalid order status.",
        });
        }

        // -----------------------------------------
        // GET CURRENT ORDER
        // -----------------------------------------

        const currentOrder = await queryRunner.manager.findOne(Order, {
        where: {
            id: Number(id),
        },

        relations: {
            user: true,
        },
        });

        if (!currentOrder) {
        await queryRunner.rollbackTransaction();

        return res.status(404).json({
            message: "Order not found.",
        });
        }

        const oldOrderStatus = currentOrder.order_status;

        const newOrderStatus =
        order_status ?? oldOrderStatus;

        // -----------------------------------------
        // CANCEL ORDER → RESTORE STOCK
        // -----------------------------------------

        if (
        newOrderStatus === "cancelled" &&
        oldOrderStatus !== "cancelled"
        ) {
        const items = await queryRunner.manager.find(OrderItem, {
            where: {
            order: {
                id: Number(id),
            },
            },

            relations: {
            product: true,
            },
        });

        for (const item of items) {
            item.product.stock += item.quantity;

            item.product.updated_at = new Date();

            await queryRunner.manager.save(
            Product,
            item.product
            );
        }
        }

        // -----------------------------------------
        // UPDATE ORDER
        // -----------------------------------------

        if (payment_status !== undefined) {
        currentOrder.payment_status = payment_status;
        }

        if (order_status !== undefined) {
        currentOrder.order_status = order_status;
        }

        const updatedOrder = await queryRunner.manager.save(
        Order,
        currentOrder
        );

        // -----------------------------------------
        // COMMIT TRANSACTION
        // -----------------------------------------

        await queryRunner.commitTransaction();

        // -----------------------------------------
        // SOCKET.IO
        // -----------------------------------------

        const io = getIO();

        // Notify customer
        io.to(`user:${updatedOrder.user.id}`).emit(
        "order_status_updated",
        {
            order: updatedOrder,
        }
        );

        // -----------------------------------------
        // SEND UPDATED PRODUCT STOCK
        // -----------------------------------------

        if (
        newOrderStatus === "cancelled" &&
        oldOrderStatus !== "cancelled"
        ) {
        const items = await orderItemRepository.find({
            where: {
            order: {
                id: Number(id),
            },
            },

            relations: {
            product: true,
            },
        });

        for (const item of items) {
            const updatedProduct =
            await productRepository.findOne({
                where: {
                id: item.product.id,
                },
            });

            if (updatedProduct) {
            io.emit(
                "updated_product",
                updatedProduct
            );
            }
        }
        }

        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        const order = {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        user_id: updatedOrder.user.id,
        total: updatedOrder.total,
        payment_method: updatedOrder.payment_method,
        payment_status: updatedOrder.payment_status,
        order_status: updatedOrder.order_status,
        created_at: updatedOrder.created_at,

        customer_name: updatedOrder.user.name,
        customer_email: updatedOrder.user.email,
        };

        res.json({
        message: "Order status updated successfully.",
        order,
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();

        console.error(
        "UpdateOrderStatus error:",
        error
        );

        res.status(500).json({
        message: "Could not update order status.",
        });

    } finally {
        await queryRunner.release();
    }
};