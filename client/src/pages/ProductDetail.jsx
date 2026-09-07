import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const FALLBACK_IMAGE =
  "https://placehold.co/600x600/F6F7FB/223A6B?text=No+Image";

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [moreProducts, setMoreProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
      window.scrollTo(0, 0);
  }, [id]);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Get current product
        const res = await api.get(`/products/${id}`);
        const currentProduct = res.data.product;

        setProduct(currentProduct);

        // Get all products
        const productsRes = await api.get("/products");
        const products = productsRes.data.products || [];

        // Remove the current product
        const otherProducts = products.filter(
          (item) => item.id !== currentProduct.id
        );

        // Show same-category products first
        const sameCategory = otherProducts.filter(
          (item) => item.category === currentProduct.category
        );

        const differentCategory = otherProducts.filter(
          (item) => item.category !== currentProduct.category
        );

        // Display maximum 4 products
        setMoreProducts(
          [...sameCategory, ...differentCategory].slice(0, 4)
        );
      } catch (err) {
        setError("Product not found.");
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");

    setStatus("");

    try {
      await addToCart(product.id, quantity);
      setStatus("Added to cart.");
    } catch (err) {
      setStatus(
        err.response?.data?.message || "Could not add to cart."
      );
    }
  };

  if (error) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-red-600">
        {error}
      </p>
    );
  }

  if (!product) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-muted">
        Loading...
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      
      <div className="grid gap-10 sm:grid-cols-2">

        
        <div className="aspect-square overflow-hidden rounded-lg border border-border bg-bg">
          <img
            src={product.image_url || FALLBACK_IMAGE}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        
        <div>
          {product.category && (
            <p className="mb-2 text-sm text-muted">
              {product.category}
            </p>
          )}

          <h1 className="mb-3 text-2xl font-800 text-ink">
            {product.name}
          </h1>

          <p className="mb-5 text-2xl font-semibold text-primary">
            Rs {Number(product.price).toFixed(2)}
          </p>

          <p className="mb-6 leading-relaxed text-muted">
            {product.description ||
              "No description available for this product."}
          </p>

          
          <p className="mb-4 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-red-500">
                Out of stock
              </span>
            )}
          </p>

          
          {!isAdmin && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
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

          {status && (
            <p className="mt-3 text-sm text-muted">
              {status}
            </p>
          )}
        </div>
      </div>

      
      <div className="mt-12 rounded-lg border border-border bg-bg p-6">
        <h2 className="mb-4 text-xl font-semibold text-ink">
          About the Store
        </h2>

        <div className="space-y-2 text-sm text-muted">
          <p>
            <span className="font-semibold text-ink">
              Store Owner:
            </span>{" "}
            Admin
          </p>

          <p>
            <span className="font-semibold text-ink">
              Role:
            </span>{" "}
            Store Administrator
          </p>

          <p>
            <span className="font-semibold text-ink">
              Support:
            </span>{" "}
            Contact the administrator for product and order
            inquiries.
          </p>
        </div>
      </div>

      
      {moreProducts.length > 0 && (
        <section className="mt-14">

          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">
              More Products to Browse
            </h2>

            <Link
              to="/products"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {moreProducts.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="group overflow-hidden rounded-lg border border-border bg-bg transition hover:shadow-md"
              >
                
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url || FALLBACK_IMAGE}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                
                <div className="p-4">
                  <p className="mb-1 text-xs text-muted">
                    {item.category}
                  </p>

                  <h3 className="truncate font-semibold text-ink">
                    {item.name}
                  </h3>

                  <p className="mt-2 font-semibold text-primary">
                    Rs {Number(item.price).toFixed(2)}
                  </p>

                  {item.stock > 0 ? (
                    <p className="mt-1 text-xs text-green-600">
                      In stock
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-red-500">
                      Out of stock
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;