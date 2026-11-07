import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";

import Overview from "./pages/Admin/Overview";
import Sales from "./pages/Admin/Sales";
import Analytics from "./pages/Admin/Analytics";
import Inventory from "./pages/Admin/Inventory";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";


import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated routes with shared header */}
        <Route element={<AppLayout />}>

          {/* User-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/inventory" element={<Inventory />} />
            </Route>
          </Route>

        </Route>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;