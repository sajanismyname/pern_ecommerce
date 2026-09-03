import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@base-ui/react";

const FALLBACK_IMAGE =
  "https://placehold.co/400x400/F6F7FB/223A6B?text=No+Image";

const ProductCard = ({ product, onAddToCart }) => {
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const navigate=useNavigate();
  const {isAdmin}=useAuth()
  return (
    <div className="card card-hover group overflow-hidden">

      {/* IMAGE */}
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-100">

          <img
            src={product.image_url || FALLBACK_IMAGE}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          {/* STOCK BADGE */}
          {outOfStock && (
            <span className="absolute left-3 top-3 badge-danger">
              Out of stock
            </span>
          )}

          {lowStock && (
            <span className="absolute left-3 top-3 badge-warning">
              Only {product.stock} left
            </span>
          )}

          {/* QUICK ACTION */}
          {!outOfStock && !isAdmin &&(
            <Button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
                navigate("/cart");
              }}
              className="
                absolute bottom-3 right-3
                flex h-10 w-10 items-center justify-center
                rounded-full bg-white
                text-slate-700
                opacity-0 shadow-lg
                transition-all duration-300
                group-hover:opacity-100
                hover:bg-blue-600
                hover:text-white
              "
            >
              <ShoppingCart size={18} />
            </Button>
          )}
          
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-4">

        {product.category && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-600">
            {product.category}
          </p>
        )}

        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900 transition-colors hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        {/* RATING */}
        {product.rating && (
          <div className="mt-2 flex items-center gap-1">
            <Star
              size={15}
              className="fill-amber-400 text-amber-400"
            />

            <span className="text-sm font-medium">
              {Number(product.rating).toFixed(1)}
            </span>
          </div>
        )}

        {/* PRICE */}
        <div className="mt-3 flex items-center justify-between">

          <span className="text-xl font-bold text-slate-900">
            Rs{Number(product.price).toFixed(2)}
          </span>

          {!outOfStock && (
            <span className="text-xs text-slate-500">
              {product.stock} available
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;