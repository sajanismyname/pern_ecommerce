import { pool } from "../config/db.js"

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

        // Get cart items
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

        // Check stock
        for (const item of items) {
        if (item.quantity > item.stock) {
            await client.query("ROLLBACK");

            return res.status(400).json({
            message: `${item.name} does not have enough stock.`,
            });
        }
        }

        // Calculate total on backend
        const total = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
        );

        // Create order
        const orderResult = await client.query(
        `INSERT INTO orders
            (user_id, total, payment_method, payment_status, order_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, total, payment_method,
                    payment_status, order_status, created_at`,
        [
            req.user.id,
            total.toFixed(2),
            paymentMethod,
            paymentMethod === "Cash on Delivery" ? "pending" : "paid",
            "pending",
        ]
        );

        const order = orderResult.rows[0];

        // Create order items
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

        // Reduce stock
        await client.query(
            `UPDATE products
            SET stock = stock - $1
            WHERE id = $2`,
            [item.quantity, item.product_id]
        );
        }
        // Clear cart
        await client.query(
        "DELETE FROM cart_items WHERE user_id = $1",
        [req.user.id]
        );

        await client.query("COMMIT");

        res.status(201).json({
        message: "Order created successfully.",
        order,
        })
        
    } catch (error) {
            await client.query("ROLLBACK");

        console.error("CreateOrder error:", error);

        res.status(500).json({
        message: "Could not create order.",
        });
    } finally {
        client.release();
    }
}

    export const getAdminOrders = async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT
            o.id,
            o.total,
            o.payment_method,
            o.payment_status,
            o.order_status,
            o.created_at,
            u.name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        `);

        res.json({
        orders: result.rows,
        });
    } catch (error) {
        console.error("GetAdminOrders error:", error);

        res.status(500).json({
        message: "Could not fetch orders.",
        });
    }
    }