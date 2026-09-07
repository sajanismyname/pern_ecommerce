    import { useEffect, useState } from "react";
    import api from "../api/axios.js";
    import { useAuth } from "../context/AuthContext.jsx";

    const Orders = () => {
    const { isAdmin } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);

    const loadOrders = async () => {
        setLoading(true);
        setError("");

        try {
        const endpoint = isAdmin ? "/orders/admin" : "/orders";

        const res = await api.get(endpoint);

        setOrders(res.data.orders || []);
        } catch (err) {
        setError(
            err.response?.data?.message ||
            "Could not load order history."
        );
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [isAdmin]);

    // Update payment or order status
    const updateStatus = async (id, field, value) => {
        setUpdating(id);
        setError("");

        try {
        const res = await api.patch(`/orders/${id}/status`, {
            [field]: value,
        });

        // Update only the changed order in the UI
        setOrders((prev) =>
            prev.map((order) =>
            order.id === id ? res.data.order : order
            )
        );
        } catch (err) {
        setError(
            err.response?.data?.message ||
            "Could not update order status."
        );
        } finally {
        setUpdating(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">


        <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-800 text-ink">
            {isAdmin ? "Orders" : "My Orders"}
            </h1>

            <p className="mt-1 text-muted">
            {isAdmin
                ? "View and manage all customer orders."
                : "View your order history and payment information."}
            </p>
        </div>


        {error && (
            <p className="mb-6 text-red-600">
            {error}
            </p>
        )}


        {loading ? (
            <p className="text-muted">
            Loading orders...
            </p>
        ) : orders.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
            <p className="text-muted">
                {isAdmin
                ? "No orders have been placed yet."
                : "You haven't placed any orders yet."}
            </p>
            </div>
        ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">

                <thead className="bg-bg text-muted">
                <tr>
                    <th className="px-4 py-3 font-medium">
                    Order
                    </th>

                    {isAdmin && (
                    <th className="px-4 py-3 font-medium">
                        Customer
                    </th>
                    )}

                    <th className="px-4 py-3 font-medium">
                    Total
                    </th>

                    <th className="px-4 py-3 font-medium">
                    Payment
                    </th>

                    <th className="px-4 py-3 font-medium">
                    Payment Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                    Order Status
                    </th>
                </tr>
                </thead>

                <tbody className="divide-y divide-border bg-surface">

                {orders.map((order) => (
                    <tr key={order.id}>

                    
                    <td className="px-4 py-4 font-medium text-ink">
                        #{order.id}
                    </td>

                    
                    {isAdmin && (
                        <td className="px-4 py-4">
                        <p className="font-medium text-ink">
                            {order.customer_name}
                        </p>

                        <p className="text-xs text-muted">
                            {order.customer_email}
                        </p>
                        </td>
                    )}

                    
                    <td className="px-4 py-4 font-semibold text-ink">
                        Rs{Number(order.total).toFixed(2)}
                    </td>

                    
                    <td className="px-4 py-4 text-muted">
                        {order.payment_method || "—"}
                    </td>

                    
                    <td className="px-4 py-4">

                        {isAdmin ? (
                        <select
                            value={order.payment_status || "pending"}
                            disabled={updating === order.id}
                            onChange={(e) =>
                            updateStatus(
                                order.id,
                                "payment_status",
                                e.target.value
                            )
                            }
                            className="rounded-md border border-border bg-bg px-2 py-1 text-sm text-ink"
                        >
                            <option value="pending">
                            Pending
                            </option>

                            <option value="paid">
                            Paid
                            </option>

                            <option value="failed">
                            Failed
                            </option>

                            <option value="refunded">
                            Refunded
                            </option>
                        </select>
                        ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {order.payment_status || "Pending"}
                        </span>
                        )}

                    </td>

                    {/* Order Status */}
                    <td className="px-4 py-4">

                        {isAdmin ? (
                        <select
                            value={order.order_status || "pending"}
                            disabled={updating === order.id}
                            onChange={(e) =>
                            updateStatus(
                                order.id,
                                "order_status",
                                e.target.value
                            )
                            }
                            className="rounded-md border border-border bg-bg px-2 py-1 text-sm text-ink"
                        >
                            <option value="pending">
                            Pending
                            </option>

                            <option value="processing">
                            Processing
                            </option>

                            <option value="shipped">
                            Shipped
                            </option>

                            <option value="delivered">
                            Delivered
                            </option>

                            <option value="cancelled">
                            Cancelled
                            </option>
                        </select>
                        ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                            {order.order_status || "Pending"}
                        </span>
                        )}

                    </td>

                    </tr>
                ))}

                </tbody>
            </table>
            </div>
        )}

        </div>
    );
    };

    export default Orders;