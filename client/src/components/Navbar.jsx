import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { User } from "lucide-react";

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const { items } = useCart();

  const cartCount =
    items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl font-800 text-ink"
        >
          PERN<span className="text-accent">ECOM</span>
        </Link>

        <nav className="flex items-center gap-8 text-sm font-medium text-ink">

          {/* Admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hover:text-primary"
            >
              Admin
            </Link>
          )}

          {/* Profile */}
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 hover:text-primary"
            >
              <User size={18} />
              Profile
            </Link>
          )}

          {/* Login / Signup */}
          {!user && (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="btn-outline !px-3 !py-1.5"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="btn-primary !px-3 !py-1.5"
              >
                Sign up
              </Link>
            </div>
          )}

        </nav>
      </div>
    </header>
  );
};

export default Navbar;