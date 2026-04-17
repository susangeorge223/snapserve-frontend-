import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";
import socket from "../socket";

export default function KitchenDashboard(){
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrdersCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/orders`);
        if (!response.ok) return;
        const orders = await response.json();
        const count = orders.filter((o) => o.status === "pending" || o.status === "new").length;
        setNewOrdersCount(count);
      } catch (err) {
        console.error("Error fetching orders count:", err);
      }
    };

    fetchOrdersCount();

    const handleOrderEvent = (payload) => {
      if (!payload || payload.resource !== 'order') return;
      fetchOrdersCount();
    };

    socket.on('dataCreated', handleOrderEvent);
    socket.on('dataUpdated', handleOrderEvent);
    socket.on('stateChanged', handleOrderEvent);

    const interval = setInterval(fetchOrdersCount, 10000);
    return () => {
      clearInterval(interval);
      socket.off('dataCreated', handleOrderEvent);
      socket.off('dataUpdated', handleOrderEvent);
      socket.off('stateChanged', handleOrderEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/kitchen-staff/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffUsername: "kitchen1" })
      });
    } catch (err) {
      console.error("Failed to log staff logout:", err);
    }
    navigate("/staff/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1>Kitchen Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#e05f5f", color: "white", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ display: "flex", gap: "40px" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          Kitchen Orders
          {newOrdersCount > 0 && (
            <span style={{ background: "red", color: "white", borderRadius: "12px", padding: "2px 8px", fontSize: "12px" }}>
              {newOrdersCount}
            </span>
          )}
        </h2>
        <p>View and manage current orders (accept, send time, serve, complete).</p>
        <Link to="/kitchen/orders">
          <button style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#333", color: "white" }}>
            Go to Orders
          </button>
        </Link>
      </div>

      <div style={{ flex: 1, background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px" }}>
        <h2>Menu Availability</h2>
        <p>Toggle item availability and sync live with customer menu.</p>
        <Link to="/kitchen/menu">
          <button style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#333", color: "white" }}>
            Go to Menu Availability
          </button>
        </Link>
      </div>
      </div>
    </div>
  );
}