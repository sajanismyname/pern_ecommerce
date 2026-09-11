    import { pool } from "../config/db.js";
    import { getIO } from "../socket.js";
    import crypto from "crypto";

export const createOrder = async (req, res) => {
        const client = await pool.connect();

        try {
            const { paymentMethod } = req.body;

            const allowedMethods = [
                "Dummy eSewa",
                "Dummy Khalti",
                "Cash on Delivery",
            ];

            if (!allowedMethods.includes(paymentMethod)) {
                return res.status(400).json({
                    message: "Invalid payment method.",
                });
            }

            await client.query("BEGIN");

            const cartResult = await client.query(
                `SELECT
            ci.product_id,
            ci.quantity,
            p.name,
            p.price,
            p.stock
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = $1`,
                [req.user.id]
            );

            if (cartResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "Your cart is empty.",
                });
            }

            const items = cartResult.rows;

            for (const item of items) {
                if (item.quantity > item.stock) {
                    await client.query("ROLLBACK");

                    return res.status(400).json({
                        message: `${item.name} does not have enough stock.`,
                    });
                }
            }

            const total = items.reduce(
                (sum, item) => sum + Number(item.price) * item.quantity,
                0
            );

            const orderNumber = `ORD-${crypto
                                .randomBytes(4)
                                .toString("hex")
                                .toUpperCase()}`;

            const orderResult = await client.query(
                `INSERT INTO orders
                (order_number, user_id, total, payment_method, payment_status, order_status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id,order_number, user_id, total, payment_method,
                    payment_status, order_status, created_at`,
                [
                    orderNumber,
                    req.user.id,
                    total.toFixed(2),
                    paymentMethod,
                    paymentMethod === "Cash on Delivery" ? "pending" : "paid",
                    "pending",
                ]
            );

            const order = orderResult.rows[0];

            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items
            (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)`,
                    [
                        order.id,
                        item.product_id,
                        item.quantity,
                        item.price,
                    ]
                );

                await client.query(
                    `UPDATE products
            SET stock = stock - $1
            WHERE id = $2`,
                    [item.quantity, item.product_id]
                );
            }

            await client.query(
                "DELETE FROM cart_items WHERE user_id = $1",
                [req.user.id]
            );

            await client.query("COMMIT");

            res.status(201).json({
                message: "Order created successfully.",
                order,
            });
        } catch (error) {
            await client.query("ROLLBACK");

            console.error("CreateOrder error:", error);

            res.status(500).json({
                message: "Could not create order.",
            });
        } finally {
            client.release();
        }
    };

// USER: Get own orders
export const getMyOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                o.id,
                o.order_number,
                o.total,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.created_at,

                COALESCE(
                    json_agg(
                        json_build_object(
                            'product_id', oi.product_id,
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'image_url', p.image_url
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL),
                    '[]'
                ) AS items

            FROM orders o

            LEFT JOIN order_items oi
                ON oi.order_id = o.id

            LEFT JOIN products p
                ON p.id = oi.product_id

            WHERE o.user_id = $1

            GROUP BY o.id

            ORDER BY o.created_at DESC
            `,
            [req.user.id]
        );

        res.json({
            orders: result.rows,
        });

    } catch (error) {
        console.error("GetMyOrders error:", error);

        res.status(500).json({
            message: "Could not fetch your orders.",
        });
    }
};

// ADMIN: Get all orders
// ADMIN: Get all orders
export const getAdminOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                o.id,
                o.order_number,
                o.user_id,
                o.total,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.created_at,

                u.name AS customer_name,
                u.email AS customer_email,

                COALESCE(
                    json_agg(
                        json_build_object(
                            'product_id', oi.product_id,
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'image_url', p.image_url
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL),
                    '[]'
                ) AS items

            FROM orders o

            JOIN users u
                ON u.id = o.user_id

            LEFT JOIN order_items oi
                ON oi.order_id = o.id

            LEFT JOIN products p
                ON p.id = oi.product_id

            GROUP BY o.id, u.name, u.email

            ORDER BY o.created_at DESC
            `
        );

        res.json({
            orders: result.rows,
        });

    } catch (error) {
        console.error("GetAdminOrders error:", error);

        res.status(500).json({
            message: "Could not fetch orders.",
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, order_status } = req.body;

        // Make sure at least one status is provided
        if (payment_status === undefined && order_status === undefined) {
        return res.status(400).json({
            message: "Payment status or order status is required.",
        });
        }

        // Validate payment status
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
        return res.status(400).json({
            message: "Invalid payment status.",
        });
        }

        // Validate order status
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
        return res.status(400).json({
            message: "Invalid order status.",
        });
        }

        // Update order
        const result = await pool.query(
        `
        UPDATE orders
        SET
            payment_status = COALESCE($1, payment_status),
            order_status = COALESCE($2, order_status)
        WHERE id = $3
        RETURNING
            id,
            order_number,
            user_id,
            total,
            payment_method,
            payment_status,
            order_status,
            created_at
        `,
        [
            payment_status ?? null,
            order_status ?? null,
            id,
        ]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Order not found.",
        });
        }

        const updatedOrder = result.rows[0];

        // Get customer information
        const customerResult = await pool.query(
        `
        SELECT
            name AS customer_name,
            email AS customer_email
        FROM users
        WHERE id = $1
        `,
        [updatedOrder.user_id]
        );

        const customer = customerResult.rows[0];

        // Combine order + customer information
        const order = {
        ...updatedOrder,
        customer_name: customer?.customer_name,
        customer_email: customer?.customer_email,
        };

        const io = getIO()

        io.to(`user:${updatedOrder.user_id}`).emit(
            "order_status_updated",
            {
                order: updatedOrder,
            }
        )

        res.json({
        message: "Order status updated successfully.",
        order,
        });
    } catch (error) {
        console.error("UpdateOrderStatus error:", error);

        res.status(500).json({
        message: "Could not update order status.",
        });
    }
    };