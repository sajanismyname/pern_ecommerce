import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { Button } from "@base-ui/react";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    const loadProducts = async () => {
  setLoading(true);
  setError("");

  try {
    const [productsRes, ordersRes] = await Promise.all([
      api.get("/products"),
      api.get("/orders/admin"),
    ]);

    setProducts(productsRes.data.products);
    setOrders(ordersRes.data.orders);
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Could not load dashboard data."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadProducts();
}, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-8">
        <div>
          <h1 className="text-2xl font-800 text-ink">Manage products</h1>
          <p className="mt-1 text-muted">Create, edit, or remove products from the catalog.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-muted">No products yet. Add your first one.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.category || "—"}</td>
                  <td className="px-4 py-3 text-ink">Rs{Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-ink">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-10">
  <div className="mb-6">
    <h2 className="text-xl font-800 text-ink">
      Orders
    </h2>

    <p className="mt-1 text-muted">
      View customer orders and payment information.
    </p>
  </div>

  {orders.length === 0 ? (
    <p className="text-muted">
      No orders yet.
    </p>
  ) : (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">
              Order
            </th>

            <th className="px-4 py-3 font-medium">
              Customer
            </th>

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

              <td className="px-4 py-3 font-medium text-ink">
                #{order.id}
              </td>

              <td className="px-4 py-3">
                <p className="font-medium text-ink">
                  {order.customer_name}
                </p>

                <p className="text-xs text-muted">
                  {order.customer_email}
                </p>
              </td>

              <td className="px-4 py-3 font-semibold text-ink">
                Rs{Number(order.total).toFixed(2)}
              </td>

              <td className="px-4 py-3 text-muted">
                {order.payment_method}
              </td>

              <td className="px-4 py-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {order.payment_status}
                </span>
              </td>

              <td className="px-4 py-3">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  {order.order_status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
    </div>
  );
};

export default AdminDashboard;
