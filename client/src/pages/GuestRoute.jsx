import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = () => {
        const { user } = useAuth();

        // Already logged in
        if (user) {
            return <Navigate to="/" replace />;
        }

        // Not logged in
        return <Outlet />;
};

export default GuestRoute;