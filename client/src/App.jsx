import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./components/RouteGuards.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProductForm from "./pages/AdminProductForm.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Orders from "./pages/Orders.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg">

      <ScrollToTop />

      
      <Navbar />

      <div className="flex">


        {user && <Sidebar />}

        
        <main className="min-w-0 flex-1">
          <Routes>


            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/products" element={<Home/>} />

            <Route
              path="/products/:id"
              element={<ProductDetail />}
            />


            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

                        <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
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
        </main>

      </div>

      <Footer />

    </div>
  );
}

export default App;