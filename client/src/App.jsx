import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { ProtectedRoute, AdminRoute } from "./components/RouteGuards.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProductForm from "./pages/AdminProductForm.jsx";

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
