    import { NavLink, useNavigate } from "react-router-dom";
    import {
    Home,
    ShoppingBag,
    ShoppingCart,
    User,
    Package,
    LogOut,
    PlusIcon,
    } from "lucide-react";

    import { useAuth } from "../context/AuthContext.jsx";
    import { useCart } from "../context/CartContext.jsx";

    const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();

    const cartCount =
        items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive
            ? "bg-surface text-ink"
            : "text-muted hover:bg-surface hover:text-ink"
        }`;

    return (
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col px-3 py-4">

        {/* Logo */}
        <div className="mb-6 px-3">
            <span className="text-xl font-bold text-ink">
            PERN<span className="text-accent">ECOM</span>
            </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1">

            {/* Home */}
            <NavLink to="/" className={linkClass}>
            <Home className="h-5 w-5" />
            Home
            </NavLink>

            {/* Customer Navigation */}
            {!isAdmin && (
            <>

                <NavLink to="/cart" className={linkClass}>
                <ShoppingCart className="h-5 w-5" />

                <span className="flex-1">
                    Cart
                </span>

                {cartCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-white">
                    {cartCount}
                    </span>
                )}
                </NavLink>

                <NavLink to="/orders" className={linkClass}>
                <Package className="h-5 w-5" />
                My Orders
                </NavLink>

                <NavLink to="/profile" className={linkClass}>
                <User className="h-5 w-5" />
                My Account
                </NavLink>
            </>
            )}

            {/* Admin Navigation */}
            {isAdmin && (
            <>
                <NavLink to="/admin" className={linkClass}>
                <ShoppingBag className="h-5 w-5" />
                Products
                </NavLink>

                <NavLink to="/orders" className={linkClass}>
                <Package className="h-5 w-5" />
                Orders
                </NavLink>

                <NavLink to="/admin/products/new" className={linkClass}>
                <PlusIcon className="h-5 w-5" />
                Add Products
                </NavLink>
            </>
            )}

        </nav>

        {/* User section */}
        {user && (
            <div className="mt-auto">

            <div className="mb-2 px-3">
                <p className="truncate text-sm font-medium text-ink">
                {user.name}
                </p>

                <p className="text-xs text-muted">
                {user.role}
                </p>
            </div>

            <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface hover:text-red-500"
            >
                <LogOut className="h-5 w-5" />
                Logout
            </button>

            </div>
        )}

        </aside>
    );
    };

    export default Sidebar;