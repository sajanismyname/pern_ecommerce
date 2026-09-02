import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const FALLBACK_IMAGE = "https://placehold.co/600x600/F6F7FB/223A6B?text=No+Image";

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => setError("Product not found."));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    setStatus("");
    try {
      await addToCart(product.id, quantity);
      setStatus("Added to cart.");
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not add to cart.");
    }
  };

  if (error) return <p className="mx-auto max-w-3xl px-6 py-10 text-red-600">{error}</p>;
  if (!product) return <p className="mx-auto max-w-3xl px-6 py-10 text-muted">Loading...</p>;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg border border-border bg-bg">
        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
        />
      </div>

      <div>
        {product.category && <p className="mb-2 text-sm text-muted">{product.category}</p>}
        <h1 className="mb-3 text-2xl font-800 text-ink">{product.name}</h1>
        <p className="mb-5 text-2xl font-semibold text-primary">
          ${Number(product.price).toFixed(2)}
        </p>
        <p className="mb-6 leading-relaxed text-muted">
          {product.description || "No description available for this product."}
        </p>

        <p className="mb-4 text-sm">
          {product.stock > 0 ? (
            <span className="text-green-600">{product.stock} in stock</span>
          ) : (
            <span className="text-red-500">Out of stock</span>
          )}
        </p>

        {!isAdmin && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input w-20"
              disabled={product.stock <= 0}
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary"
            >
              Add to cart
            </button>
          </div>
        )}

        {status && <p className="mt-3 text-sm text-muted">{status}</p>}
      </div>
    </div>
  );
};

export default ProductDetail;
