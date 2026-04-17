import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function AddMenuItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    available: true
  });
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/menu`);
        const menuItems = await res.json();
        const unique = [...new Set(menuItems.map((item) => item.category || ""))].filter(Boolean);
        setCategoryOptions(unique);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          available: formData.available
        })
      });
      if (response.ok) {
        alert("Menu item added successfully!");
        navigate("/admin/menu");
      } else {
        alert("Failed to add menu item");
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Error adding menu item");
    }
  };

  return (
    <div style={styles.page} className="responsive-page add-menu-page">
      <div style={styles.container} className="add-menu-card">
        <h1 style={styles.title}>Add New Menu Item</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Category:</label>
            <input
              type="text"
              name="category"
              list="category-list"
              value={formData.category}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <datalist id="category-list">
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                style={styles.checkbox}
              />
              Available
            </label>
          </div>
          <button type="submit" style={styles.button}>Add Item</button>
        </form>
        <button style={styles.backButton} onClick={() => navigate("/admin/menu")}>
          ← Back to Menu Management
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(180deg,#0b1a13,#10271d)",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    width: "500px",
    background: "rgba(0,0,0,0.25)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.65)"
  },
  title: {
    marginBottom: "20px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  field: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    outline: "none"
  },
  checkbox: {
    marginRight: "10px"
  },
  button: {
    padding: "12px",
    background: "#d4af37",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px"
  },
  backButton: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer"
  }
};