import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartCount = items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-800 text-ink">
          PERN<span className="text-accent">ECOM</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <Link to="/" className="hover:text-primary">
            Shop
          </Link>

          {isAdmin && (
            <Link to="/admin" className="hover:text-primary">
              Admin
            </Link>
          )}

          {user && !isAdmin && (
            <Link to="/cart" className="relative hover:text-primary">
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">

                <Link
                  to="/profile"
                  className="flex items-center gap-2"
                >
                  <User size={18} />
                  Profile
                </Link>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="!px-3 !py-1.5"
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-outline !px-3 !py-1.5">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-3 !py-1.5">
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
