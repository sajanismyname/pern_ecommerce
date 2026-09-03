import { useEffect, useState } from "react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {isAdmin}=useAuth()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      api
        .get("/products", { params: search ? { search } : {} })
        .then((res) => setProducts(res.data.products))
        .catch(() => setError("Could not load products right now."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-800 text-ink">Everything you need, in one place.</h1>
          <p className="mt-1 text-muted">Browse the full catalog below.</p>
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input sm:w-72"
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <p className="text-muted">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-muted">No products match your search yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
