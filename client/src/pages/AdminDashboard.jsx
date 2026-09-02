import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = () => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data.products))
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

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
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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

export default AdminDashboard;
