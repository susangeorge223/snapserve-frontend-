import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function StaffLogin() {

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  const navigate = useNavigate();

  const login = async () => {

    if (username === "admin1" && password === "1234") {
      // Log admin login
      try {
        console.log("📤 Sending admin login request for:", username);
        const response = await fetch(`${API_BASE}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminUsername: username, password: password })
        });
        const data = await response.json();
        console.log("📥 Admin login response:", data);
      } catch (err) {
        console.error("❌ Failed to log admin login:", err);
      }
      navigate("/admin");
    }

    else if (username === "kitchen1" && password === "1234") {
      // Log kitchen staff login
      try {
        console.log("📤 Sending login request for:", username);
        const response = await fetch(`${API_BASE}/api/kitchen-staff/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffUsername: username, staffName: "Kitchen Staff", password: password })
        });
        const data = await response.json();
        console.log("📥 Login response:", data);
      } catch (err) {
        console.error("❌ Failed to log staff login:", err);
      }
      navigate("/kitchen");
    }

    else {
      alert("Invalid login");
    }

  };

  return (

    <div style={styles.page} className="responsive-page staff-login-page">

      <div style={styles.card} className="login-card">

        <p style={styles.smallTitle}>STAFF</p>

        <h1 style={styles.special}>Login</h1>

        <p style={styles.menu}>SNAPSERVE</p>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          style={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={login}>
          Login
        </button>

      </div>

    </div>

  );

}

const styles = {

  page: {
    height: "100vh",
    padding: "40px",
    background: "linear-gradient(180deg,#0b1a13,#10271d)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "system-ui, -apple-system"
  },

  card: {
    width: "420px",
    padding: "48px",
    borderRadius: "18px",
    background: "rgba(0,0,0,0.35)",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.65)",
    color: "#fff"
  },

  smallTitle: {
    letterSpacing: "3px",
    color: "#d4af37",
    fontWeight: 600,
    marginBottom: "8px"
  },

  special: {
    fontSize: "56px",
    fontFamily: "cursive",
    margin: "0"
  },

  menu: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#d4af37",
    marginTop: "10px",
    marginBottom: "30px"
  },

  input: {
    width:"100%",
    padding:"12px",
    marginBottom:"15px",
    borderRadius:"8px",
    border:"none",
    outline:"none",
    fontSize:"14px"
  },

  button: {
    marginTop: "10px",
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    background: "#d4af37",
    color: "#111",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
    width:"100%"
  }

};