import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "../api";
import socket from "../socket";
import { Link } from "react-router-dom";

function AdminMenuManagement() {

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuData, setMenuData] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", price: "", available: true });
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  const submitNewItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newItem.name.trim(),
        category: newItem.category.trim() || "Uncategorized",
        price: Number(newItem.price),
        available: newItem.available
      };

      if (!payload.name || !payload.category || Number.isNaN(payload.price)) {
        alert("Name, category and price are required.");
        return;
      }

      const res = await fetch(`${API_BASE}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create item");
      }

      const created = await res.json();
      setMenuData((prev) => [...prev, created]);
      setNewItem({ name: "", category: "", price: "", available: true });
      setIsAdding(false);
      setCategorySuggestions([]);
    } catch (error) {
      console.error("Create menu item failed:", error);
      alert("Could not add menu item (see console). ");
    }
  };

  const onNewItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (name === "category") {
      const existingCategories = [...new Set(menuData.map(item => item.category).filter(Boolean))];
      const filtered = existingCategories.filter(cat => cat.toLowerCase().startsWith(value.toLowerCase()) && cat.toLowerCase() !== value.toLowerCase());
      setCategorySuggestions(filtered);
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE}/menu/${itemId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      setMenuData((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("Delete menu item error:", err);
      alert("Could not delete menu item. Check console.");
    }
  };

  const updatePrice = async (itemId, newPrice) => {
    const floatPrice = Number(newPrice);
    if (Number.isNaN(floatPrice) || floatPrice < 0) {
      alert("Enter a valid positive price.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/menu/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: floatPrice })
      });

      if (!response.ok) {
        throw new Error("Failed to update price");
      }

      const updated = await response.json();
      setMenuData((prev) => prev.map((item) => (item._id === itemId ? updated : item)));
      setEditingItemId(null);
      setEditingPrice("");
    } catch (err) {
      console.error("Update price error:", err);
      alert("Could not update price. Check console.");
    }
  };

  const startEditingPrice = (item) => {
    setEditingItemId(item._id);
    setEditingPrice(String(item.price));
  };

  const finishEditingPrice = (itemId) => {
    if (editingPrice === "") {
      setEditingItemId(null);
      return;
    }
    updatePrice(itemId, editingPrice);
  };

  const updateMenuItem = async (itemId, newName, newPrice) => {
    const floatPrice = Number(newPrice);
    if (!newName.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    if (Number.isNaN(floatPrice) || floatPrice < 0) {
      alert("Enter a valid positive price.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/menu/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), price: floatPrice })
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const updated = await response.json();
      setMenuData((prev) => prev.map((item) => (item._id === itemId ? updated : item)));
      setEditMode(null);
      setEditingName("");
      setEditingPrice("");
    } catch (err) {
      console.error("Update item error:", err);
      alert("Could not update item. Check console.");
    }
  };

  const startEditingItem = (item) => {
    setEditMode(item._id);
    setEditingName(item.name);
    setEditingPrice(String(item.price));
  };

  const finishEditingItem = (itemId) => {
    if (editingName === "" || editingPrice === "") {
      alert("Name and price cannot be empty.");
      return;
    }
    updateMenuItem(itemId, editingName, editingPrice);
  };

  useEffect(() => {
    const fetchMenu = () => {
      fetch(`${API_BASE}/menu`)
        .then((res) => res.json())
        .then((data) => setMenuData(data))
        .catch((err) => console.error("Menu fetch error:", err));
    };

    fetchMenu(); // initial fetch

    const handleMenuEvent = (payload) => {
      if (!payload || payload.resource !== 'menu') return;
      fetchMenu();
    };

    socket.on('dataCreated', handleMenuEvent);
    socket.on('dataUpdated', handleMenuEvent);
    socket.on('dataDeleted', handleMenuEvent);
    socket.on('stateChanged', handleMenuEvent);

    const interval = setInterval(fetchMenu, 10000); // fallback polling

    return () => {
      clearInterval(interval);
      socket.off('dataCreated', handleMenuEvent);
      socket.off('dataUpdated', handleMenuEvent);
      socket.off('dataDeleted', handleMenuEvent);
      socket.off('stateChanged', handleMenuEvent);
    };
  }, []);

  const aiRecommendations = [
    { name: "Cold Coffee", price: 190 },
    { name: "Masala Chai", price: 57 },
    { name: "French Fries", price: 171 },
    { name: "Chicken Burger", price: 248 },
    { name: "Cappuccino", price: 133 },
    { name: "Chocolate Truffle Pastry", price: 124 }
  ];

  const categories = menuData.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const categoryList = Object.keys(categories)
    .sort()
    .map((name) => ({ name, items: categories[name] }));

  const halfIndex = Math.ceil(categoryList.length / 2);
  const leftColumn = categoryList.slice(0, halfIndex);
  const rightColumn = categoryList.slice(halfIndex);

  // Debug
  if (menuData.length > 0) {
    console.log("✓ menuData loaded:", menuData.length, "items");
    console.log("✓ categories created:", Object.keys(categories).length);
    console.log("✓ categoryList:", categoryList.map(c => c.name));
    console.log("✓ leftColumn:", leftColumn.map(c => c.name));
    console.log("✓ rightColumn:", rightColumn.map(c => c.name));
  } else {
    console.log("⚠ menuData not yet loaded");
  }

 const filterItems = (items) =>
  items.filter((item) =>
    item.available !== false &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>

      <div style={styles.topBar}>
        <input
          style={styles.search}
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          style={styles.cart}
          onClick={() => setIsAdding((prev) => !prev)}
        >
          {isAdding ? "✖ Close" : "➕ Add Item"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={submitNewItem} style={styles.addBox}>
          <input
            name="name"
            value={newItem.name}
            onChange={onNewItemChange}
            required
            placeholder="Item name"
            style={styles.fieldInput}
          />
          <div style={{ position: 'relative' }}>
            <input
              name="category"
              value={newItem.category}
              onChange={onNewItemChange}
              required
              placeholder="Category"
              style={styles.fieldInput}
            />
            {categorySuggestions.length > 0 && (
              <div style={styles.suggestions}>
                {categorySuggestions.map(sug => (
                  <div key={sug} style={styles.suggestion} onClick={() => {
                    setNewItem(prev => ({ ...prev, category: sug }));
                    setCategorySuggestions([]);
                  }}>
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            name="price"
            value={newItem.price}
            onChange={onNewItemChange}
            required
            type="number"
            step="0.01"
            placeholder="Price"
            style={styles.fieldInput}
          />
          <label style={{ color: "white", fontSize: "14px", marginRight: "12px" }}>
            <input
              type="checkbox"
              name="available"
              checked={newItem.available}
              onChange={onNewItemChange}
              style={{ marginRight: "6px" }}
            />
            Available
          </label>
          <button type="submit" style={styles.button}>Save to DB</button>
        </form>
      )}

      <div style={styles.recommendBox}>

        <h2 style={styles.heading}>Recommended For You</h2>

        {aiRecommendations.map((item) => (
          <div key={item.name} style={styles.menuItem}>
            <span>{item.name} - ₹{item.price}</span>

            <button
              style={styles.button}
              onClick={() => {}}
            >
              Add
            </button>

          </div>
        ))}

      </div>

      <div style={styles.menuColumns}>

        <div style={styles.menuBox}>

          {leftColumn.map((category) => (

            <div key={category.name} style={styles.category}>

              <h3 style={styles.categoryTitle}>
                {category.name}
              </h3>

              {filterItems(category.items).map((item) => (

                <div key={item.name} style={editMode === item._id ? {...styles.menuItem, background: "rgba(255,255,255,0.1)"} : styles.menuItem}>

  {editMode === item._id ? (
    <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "8px"}}>
      <input
        type="text"
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        placeholder="Item name"
        style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d4af37", background: "rgba(0,0,0,0.3)", color: "white" }}
      />
      <input
        type="number"
        value={editingPrice}
        onChange={(e) => setEditingPrice(e.target.value)}
        placeholder="Price"
        style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d4af37", background: "rgba(0,0,0,0.3)", color: "white" }}
      />
    </div>
  ) : (
    <div>
      <div>{item.name}</div>
      {item.desc && <small style={{opacity:0.7}}>{item.desc}</small>}
    </div>
  )}

  <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
    
    {editMode === item._id ? (
      <>
        <button
          style={{ ...styles.button, background: "#4caf50", fontSize: "12px", padding: "6px 10px" }}
          onClick={() => finishEditingItem(item._id)}
        >
          Save
        </button>
        <button
          style={{ ...styles.button, background: "#666", fontSize: "12px", padding: "6px 10px" }}
          onClick={() => {
            setEditMode(null);
            setEditingName("");
            setEditingPrice("");
          }}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {editingItemId === item._id ? (
          <input
            type="number"
            value={editingPrice}
            onChange={(e) => setEditingPrice(e.target.value)}
            onBlur={() => finishEditingPrice(item._id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                finishEditingPrice(item._id);
              }
              if (e.key === "Escape") {
                setEditingItemId(null);
                setEditingPrice("");
              }
            }}
            style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "none", background: "rgba(0,0,0,0.3)", color: "white" }}
            autoFocus
          />
        ) : (
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => startEditingPrice(item)}>
            ₹{item.price}
          </span>
        )}

        <button
          style={{ ...styles.button, background: "#2196F3" }}
          onClick={() => startEditingItem(item)}
        >
          Edit
        </button>

        <button
          style={{ ...styles.button, background: "#e05f5f" }}
          onClick={() => deleteMenuItem(item._id)}
        >
          Delete
        </button>
      </>
    )}

  </div>

</div>

              ))}

            </div>

          ))}

        </div>

        <div style={styles.menuBox}>

          {rightColumn.map((category) => (

            <div key={category.name} style={styles.category}>

              <h3 style={styles.categoryTitle}>
                {category.name}
              </h3>

              {filterItems(category.items).map((item) => (

                <div key={item.name} style={editMode === item._id ? {...styles.menuItem, background: "rgba(255,255,255,0.1)"} : styles.menuItem}>

  {editMode === item._id ? (
    <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "8px"}}>
      <input
        type="text"
        value={editingName}
        onChange={(e) => setEditingName(e.target.value)}
        placeholder="Item name"
        style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d4af37", background: "rgba(0,0,0,0.3)", color: "white" }}
      />
      <input
        type="number"
        value={editingPrice}
        onChange={(e) => setEditingPrice(e.target.value)}
        placeholder="Price"
        style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #d4af37", background: "rgba(0,0,0,0.3)", color: "white" }}
      />
    </div>
  ) : (
    <div>
      <div>{item.name}</div>
      {item.desc && <small style={{opacity:0.7}}>{item.desc}</small>}
    </div>
  )}

  <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
    
    {editMode === item._id ? (
      <>
        <button
          style={{ ...styles.button, background: "#4caf50", fontSize: "12px", padding: "6px 10px" }}
          onClick={() => finishEditingItem(item._id)}
        >
          Save
        </button>
        <button
          style={{ ...styles.button, background: "#666", fontSize: "12px", padding: "6px 10px" }}
          onClick={() => {
            setEditMode(null);
            setEditingName("");
            setEditingPrice("");
          }}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {editingItemId === item._id ? (
          <input
            type="number"
            value={editingPrice}
            onChange={(e) => setEditingPrice(e.target.value)}
            onBlur={() => finishEditingPrice(item._id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                finishEditingPrice(item._id);
              }
              if (e.key === "Escape") {
                setEditingItemId(null);
                setEditingPrice("");
              }
            }}
            style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "none", background: "rgba(0,0,0,0.3)", color: "white" }}
            autoFocus
          />
        ) : (
          <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => startEditingPrice(item)}>
            ₹{item.price}
          </span>
        )}

        <button
          style={{ ...styles.button, background: "#2196F3" }}
          onClick={() => startEditingItem(item)}
        >
          Edit
        </button>

        <button
          style={{ ...styles.button, background: "#e05f5f" }}
          onClick={() => deleteMenuItem(item._id)}
        >
          Delete
        </button>
      </>
    )}

  </div>

</div>

              ))}

            </div>

          ))}

        </div>

      </div>

      <Link to="/admin">
        <button style={{ marginTop: "20px", padding: "8px 12px" }}>← Back to Admin Dashboard</button>
      </Link>

    </div>
  );

}

/* FIX ADDED — styles object */

const styles = {

page:{
minHeight:"100vh",
padding:"40px",
background:"linear-gradient(180deg,#0b1a13,#10271d)",
color:"white",
width:"100%"
},

topBar:{
display:"flex",
justifyContent:"space-between",
marginBottom:"25px"
},

search:{
padding:"10px 14px",
borderRadius:"8px",
border:"1px solid rgba(255,255,255,0.25)",
width:"260px",
background:"rgba(255,255,255,0.1)",
color:"white",
outline:"none"
},

cart:{
fontWeight:"bold",
fontSize:"16px",
background:"rgba(255,255,255,0.08)",
border:"1px solid rgba(255,255,255,0.2)",
padding:"8px 16px",
borderRadius:"8px",
color:"white",
cursor:"pointer"
},

recommendBox:{
padding:"25px",
borderRadius:"12px",
background:"rgba(0,0,0,0.25)",
marginBottom:"35px",
boxShadow:"0 10px 30px rgba(0,0,0,0.65)"
},

heading:{
marginBottom:"15px"
},

menuColumns:{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"60px"
},

menuBox:{
background:"rgba(0,0,0,0.25)",
padding:"25px",
borderRadius:"12px",
boxShadow:"0 10px 30px rgba(0,0,0,0.65)"
},

category:{
marginBottom:"30px"
},

categoryTitle:{
color:"#d4af37",
marginBottom:"10px"
},

menuItem:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"15px",
marginBottom:"10px",
background:"rgba(255,255,255,0.05)",
borderRadius:"8px",
boxShadow:"0 10px 30px rgba(0,0,0,0.65)"
},

addBox:{
marginBottom:"20px",
display:"flex",
flexWrap:"wrap",
gap:"10px",
background:"rgba(0,0,0,0.22)",
padding:"12px",
borderRadius:"10px"
},

fieldInput:{
background:"rgba(255,255,255,0.08)",
border:"1px solid rgba(227,227,227,0.35)",
color:"white",
padding:"10px",
borderRadius:"6px",
width:"160px"
},

button:{
background:"#d4af37",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer"
},

suggestions:{
position: 'absolute',
top: '100%',
left: 0,
background:"rgba(0,0,0,0.8)",
border:"1px solid rgba(227,227,227,0.35)",
borderRadius:"6px",
maxHeight:"150px",
overflowY:"auto",
width:"160px",
zIndex:10
},

suggestion:{
padding:"8px",
cursor:"pointer",
color:"white",
borderBottom:"1px solid rgba(255,255,255,0.1)"
}

};

export default AdminMenuManagement;