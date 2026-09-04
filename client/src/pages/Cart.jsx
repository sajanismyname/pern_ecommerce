import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useEffect } from "react";

const FALLBACK_IMAGE =
  "https://placehold.co/100x100/F6F7FB/223A6B?text=Item";

const Cart = () => {
  const { items, total, loading, updateQuantity, removeItem } = useCart();

  useEffect(() => {
            window.scrollTo(0, 0);
        }, []);

  // Loading state
  if (loading) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-muted">
        Loading cart...
      </p>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="mb-2 text-2xl font-800 text-ink">
          Your cart is empty
        </h1>

        <p className="mb-6 text-muted">
          Add a few things you like — they'll show up here.
        </p>

        <Link to="/" className="btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      
      {/* Cart heading */}
      <h1 className="mb-6 text-2xl font-800 text-ink">
        Your cart
      </h1>

      {/* Cart items */}
      <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-surface">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-4 p-4"
            >
              {/* Product image */}
              <img
                src={item.image_url || FALLBACK_IMAGE}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              {/* Product information */}
              <div className="min-w-[140px] flex-1">
                <p className="truncate font-medium text-ink">
                  {item.name}
                </p>

                <p className="text-sm text-muted">
                  Rs{Number(item.price).toFixed(2)} each
                </p>
              </div>

              {/* Quantity */}
              <input
                type="number"
                min={1}
                max={item.stock}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.id, Number(e.target.value))
                }
                className="input w-16 shrink-0 text-center"
              />

              {/* Item total */}
              <p className="w-28 shrink-0 whitespace-nowrap text-right font-semibold text-ink">
                Rs{(Number(item.price) * item.quantity).toFixed(2)}
              </p>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                className="shrink-0 whitespace-nowrap text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart total and checkout */}
      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg font-semibold text-ink">
          Total: Rs{total.toFixed(2)}
        </span>

        <Link
          to="/checkout"
          className="btn-primary text-center"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;