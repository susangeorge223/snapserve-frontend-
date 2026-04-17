import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import KitchenDashboard from "./pages/KitchenDashboard";
import KitchenOrders from "./pages/KitchenOrders";
import KitchenMenuAvailability from "./pages/KitchenMenuAvailability";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMenuManagement from "./pages/AdminMenuManagement";
import AdminSalesOverview from "./pages/AdminSalesOverview";
import AdminSystemAvailability from "./pages/AdminSystemAvailability";
import StaffLogin from "./pages/StaffLogin";
import AddMenuItem from "./pages/AddMenuItem";
function App() {

  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {

      const existing = prev.find((i) => i.name === item.name);

      if (existing) {
        return prev.map((i) =>
          i.name === item.name
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  return (

    <BrowserRouter>

      <Routes>

  <Route
    path="/"
    element={<Landing />}
  />

  <Route
    path="/menu"
    element={<Menu cart={cart} addToCart={addToCart} />}
  />

  <Route
    path="/cart"
    element={<Cart cart={cart} setCart={setCart} />}
  />

  <Route
    path="/staff/login"
    element={<StaffLogin />}
  />

  <Route
    path="/kitchen"
    element={<KitchenDashboard />}
  />

  <Route
    path="/kitchen/orders"
    element={<KitchenOrders />}
  />

  <Route
    path="/kitchen/menu"
    element={<KitchenMenuAvailability />}
  />

  <Route
    path="/admin"
    element={<AdminDashboard />}
  />

  <Route
    path="/admin/menu"
    element={<AdminMenuManagement />}
  />

  <Route
    path="/admin/orders"
    element={<AdminSalesOverview />}
  />

  <Route
    path="/admin/sales"
    element={<AdminSystemAvailability />}
  />
  <Route
    path="/admin/add-item"
    element={<AddMenuItem />}
  />
  </Routes>

    </BrowserRouter>

  );
}

export default App;