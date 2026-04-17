import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function Landing() {
  const navigate = useNavigate();

  const startOrdering = async () => {
    const existingSessionId = localStorage.getItem("sessionId");
    if (existingSessionId) {
      navigate("/menu");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      localStorage.setItem("sessionId", data.sessionId);
      navigate("/menu");
    } catch (error) {
      console.error("Failed to start session:", error);
      navigate("/menu"); // still navigate even if session fails
    }
  };

    return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.smallTitle}>TODAY’S</p>

        <h1 style={styles.special}>Special</h1>

        <p style={styles.menu}>FOOD MENU</p>

        <button style={styles.button} onClick={startOrdering}>
          Start Ordering
        </button>
      </div>
    </div>
  );
}

const styles = {

  page: {
    height: "100vh",
    padding: "40px",
    background:
  "linear-gradient(180deg,#0b1a13,#10271d)",
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
  color: "#fff",

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
    margin: "0",
  },

  menu: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#d4af37",
    marginTop: "10px"
  },

  button: {
    marginTop: "36px",
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    background: "#d4af37",
    color: "#111",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer"
  },

  metaRow: {
    marginTop: "18px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    opacity: 0.9,
    fontSize: "12px"
  },

  meta: {
    color: "rgba(255,255,255,0.75)"
  },

  metaDot: {
    color: "rgba(255,255,255,0.35)"
  },

  metaLink: {
    color: "#d4af37",
    textDecoration: "none",
    fontWeight: 650
  }
};