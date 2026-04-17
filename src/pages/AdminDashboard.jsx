import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function AdminDashboard(){
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("📤 Sending admin logout request");
      const response = await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: "admin1" })
      });
      const data = await response.json();
      console.log("📥 Admin logout response:", data);
    } catch (err) {
      console.error("❌ Failed to log admin logout:", err);
    }
    navigate("/staff/login");
  };
  return (
    <div style={{ padding: "40px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ width: "100%", textAlign: "right", marginBottom: "20px" }}>
        <button 
          onClick={handleLogout}
          style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#d32f2f", color: "white", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px", minWidth: "250px" }}>
        <h2>Menu Management</h2>
        <p>Manage menu items, categories, and pricing.</p>
        <Link to="/admin/menu">
          <button style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#333", color: "white" }}>
            Go to Menu Management
          </button>
        </Link>
      </div>

      <div style={{ flex: 1, background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px", minWidth: "250px" }}>
        <h2>Sales Overview</h2>
        <p>Monitor all orders, statuses, and performance.</p>
        <Link to="/admin/orders">
          <button style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#333", color: "white" }}>
            Go to Sales Overview
          </button>
        </Link>
      </div>

      <div style={{ flex: 1, background: "rgba(0,0,0,0.1)", padding: "20px", borderRadius: "10px", minWidth: "250px" }}>
        <h2>System Availability</h2>
        <p>View system status, uptime, and reports.</p>
        <Link to="/admin/sales">
          <button style={{ padding: "10px 16px", borderRadius: "6px", border: "none", background: "#333", color: "white" }}>
            Go to System Availability
          </button>
        </Link>
      </div>
    </div>
  );
}