    import { Link } from "react-router-dom";
    import {useAuth} from "../context/AuthContext"
    import {
    ShoppingBag,
    Mail,
    Phone,
    MapPin,
    } from "lucide-react";

const Footer = () => {

    const {user, isAdmin}=useAuth()

    return (
        <>
        {!isAdmin && (
                    <footer className="mt-16 border-t border-border bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-12">

            {/* Main Footer */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* Store Info */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />

                <span className="text-xl font-bold text-ink">
                    PERNECOM
                </span>
                </div>

                <p className="max-w-xs text-sm leading-relaxed text-muted">
                Shop quality products at affordable prices.
                We make online shopping simple, convenient,
                and reliable.
                </p>
            </div>

            {/* Shop */}
            <div>
                <h3 className="mb-4 font-semibold text-ink">
                Shop
                </h3>

                <div className="flex flex-col gap-3 text-sm">
                <Link
                    to="/"
                    className="text-muted transition hover:text-primary"
                >
                    Products
                </Link>

                <Link
                    to={user? "/cart" : "/login"}
                    className="text-muted transition hover:text-primary"
                >
                    Cart
                </Link>

                <Link
                    to={user? "/profile" : "/login"}
                    className="text-muted transition hover:text-primary"
                >
                    My Account
                </Link>
                </div>
            </div>

            {/* Customer Support */}
            <div>
                <h3 className="mb-4 font-semibold text-ink">
                Customer Support
                </h3>

                <div className="space-y-3 text-sm text-muted">

                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@PERNECOM.com</span>
                </div>

                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+977 9800000000</span>
                </div>

                <div className="flex items-start gap-2">
                    
                <a
                    href="https://www.google.com/maps/place/Nepal/@27.654553,82.9186939,6.96z/data=!4m6!3m5!1s0x3995e8c77d2e68cf:0x34a29abcd0cc86de!8m2!3d28.394857!4d84.124008!16zL20vMDE2end0?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                    >
                    <MapPin className="h-4 w-4 shrink-0" />
                    Nepal
                </a>
                </div>

                </div>
            </div>

            {/* Information */}
            <div>
                <h3 className="mb-4 font-semibold text-ink">
                Information
                </h3>

                <div className="flex flex-col gap-3 text-sm">
                <Link
                    to="#"
                    className="text-muted transition hover:text-primary"
                >
                    About Us
                </Link>

                <Link
                    to="#"
                    className="text-muted transition hover:text-primary"
                >
                    Shipping & Returns
                </Link>

                <Link
                    to="#"
                    className="text-muted transition hover:text-primary"
                >
                    Privacy Policy
                </Link>

                <Link
                    to="#"
                    className="text-muted transition hover:text-primary"
                >
                    Terms & Conditions
                </Link>
                </div>
            </div>

            </div>

            {/* Bottom */}
            <div className="mt-10 border-t border-border pt-6">
            <div className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">

                <p>
                © 2026 Your Store. All rights reserved.
                </p>

                <p>
                Managed by Store Admin
                </p>

            </div>
            </div>

        </div>
        </footer>
        )}
        </>
    );
    };

    export default Footer;