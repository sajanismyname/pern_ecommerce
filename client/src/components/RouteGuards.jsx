import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Protect routes that require a logged-in user
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center text-muted">
        Loading...
      </div>
    );
  }

  // Guest trying to access protected route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


// Protect routes that require an admin
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center text-muted">
        Loading...
      </div>
    );
  }

  // Guest trying to access admin route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normal user trying to access admin route
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};


// Protect routes that should only be accessible to guests
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center text-muted">
        Loading...
      </div>
    );
  }

  // Logged-in user trying to access login/register
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};