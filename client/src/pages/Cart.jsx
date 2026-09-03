import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const FALLBACK_IMAGE = "https://placehold.co/100x100/F6F7FB/223A6B?text=Item";

const Cart = () => {
  const { items, total, loading, updateQuantity, removeItem } = useCart();

  if (loading) return <p className="mx-auto max-w-3xl px-6 py-10 text-muted">Loading cart...</p>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="mb-2 text-2xl font-800 text-ink">Your cart is empty</h1>
        <p className="mb-6 text-muted">Add a few things you like — they'll show up here.</p>
        <Link to="/" className="btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-800 text-ink">Your cart</h1>

      <div className="divide-y divide-border rounded-lg border border-border bg-surface">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <img
              src={item.image_url || FALLBACK_IMAGE}
              alt={item.name}
              className="h-16 w-16 rounded-md border border-border object-cover"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />
            <div className="flex-1">
              <p className="font-medium text-ink">{item.name}</p>
              <p className="text-sm text-muted">Rs{Number(item.price).toFixed(2)} each</p>
            </div>
            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="input w-16 text-center"
            />
            <p className="w-20 text-right font-semibold text-ink">
              Rs{(Number(item.price) * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(item.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
        <span className="text-lg font-semibold text-ink">Total: Rs{total.toFixed(2)}</span>
        <button className="btn-primary">Proceed to checkout</button>
      </div>
    </div>
  );
};

export default Cart;
