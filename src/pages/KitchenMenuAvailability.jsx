import { useEffect, useState } from "react";
import { API_BASE } from "../api";
import socket from "../socket";
import { Link } from "react-router-dom";

export default function KitchenMenuAvailability(){
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchMenu = () => {
      fetch(`${API_BASE}/menu`)
        .then(res => res.json())
        .then(data => setMenu(data))
        .catch(err => console.error("Error fetching menu:", err));
    };

    fetchMenu();

    const handleMenuEvent = (payload) => {
      if (!payload || payload.resource !== 'menu') return;
      fetchMenu();
    };

    socket.on('dataCreated', handleMenuEvent);
    socket.on('dataUpdated', handleMenuEvent);
    socket.on('dataDeleted', handleMenuEvent);
    socket.on('stateChanged', handleMenuEvent);

    const interval = setInterval(fetchMenu, 10000);
    return () => {
      clearInterval(interval);
      socket.off('dataCreated', handleMenuEvent);
      socket.off('dataUpdated', handleMenuEvent);
      socket.off('dataDeleted', handleMenuEvent);
      socket.off('stateChanged', handleMenuEvent);
    };
  }, []);

  const menuCategories = menu.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categoryList = Object.keys(menuCategories)
    .sort()
    .map((name) => ({ name, items: menuCategories[name] }));

  const toggleAvailability = async (item) => {
    try {
      const response = await fetch(`${API_BASE}/menu/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update availability");
      }
      const updated = await response.json();
      setMenu((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    } catch (err) {
      console.error("Toggle availability failed", err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <Link to="/kitchen">
        <button style={{ marginBottom: "16px", padding: "8px 12px" }}>← Back to Kitchen Dashboard</button>
      </Link>
      <h1>Menu Availability</h1>

      {categoryList.length === 0 ? (
        <p>Loading menu data...</p>
      ) : (
        categoryList.map((cat) => (
          <div key={cat.name} style={{ marginBottom: "18px" }}>
            <h3>{cat.name}</h3>
            {cat.items.map((item) => (
              <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span>{item.name}</span>
                <button
                  onClick={() => toggleAvailability(item)}
                  style={{
                    background: item.available ? "green" : "red",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "5px"
                  }}
                >
                  {item.available ? "Available" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
