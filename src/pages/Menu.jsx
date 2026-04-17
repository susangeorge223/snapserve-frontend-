import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "../api";
import socket from "../socket";
function Menu({ addToCart, cart }) {

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuData, setMenuData] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState({
    weather: [],
    time: [],
    orders: [],
    popular: []
  });
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentRecIndex, setCurrentRecIndex] = useState(0);
  const [slideVisible, setSlideVisible] = useState(true);
  const recCategories = ['weather', 'time', 'orders'];
  useEffect(() => {
    const fetchMenu = () => {
      fetch(`${API_BASE}/menu?available=true`)
        .then((res) => res.json())
        .then((data) => {
          setMenuData(data);
          // Track views for all menu items
          const sessionId = localStorage.getItem("sessionId");
          if (sessionId && data.length > 0) {
            data.forEach(item => {
              fetch(`${API_BASE}/api/behavior/view`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  sessionId,
                  itemId: item._id
                })
              }).catch(err => console.error("View tracking error:", err));
            });
          }
        })
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

  useEffect(() => {
    const fetchRecommendations = () => {
      const sessionId = localStorage.getItem("sessionId");
      console.log("Current sessionId:", sessionId);
      if (sessionId) {
        setIsLoadingRec(true);

        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              fetch(`${API_BASE}/api/recommendations?sessionId=${sessionId}&lat=${lat}&lon=${lon}`)
                .then((res) => res.json())
                .then((data) => {
                  setAiRecommendations(data);
                  setLastUpdated(new Date());
                  setIsLoadingRec(false);
                })
                .catch((err) => {
                  console.error("Recommendations fetch error:", err);
                  setIsLoadingRec(false);
                });
            },
            (error) => {
              console.warn("Geolocation error:", error.message, "- using default location");
              // Fallback to default location (Chennai)
              fetch(`${API_BASE}/api/recommendations?sessionId=${sessionId}`)
                .then((res) => res.json())
                .then((data) => {
                  setAiRecommendations(data);
                  setLastUpdated(new Date());
                  setIsLoadingRec(false);
                })
                .catch((err) => {
                  console.error("Recommendations fetch error:", err);
                  setIsLoadingRec(false);
                });
            },
            { timeout: 10000, enableHighAccuracy: false }
          );
        } else {
          console.warn("Geolocation not supported, using default location");
          fetch(`${API_BASE}/api/recommendations?sessionId=${sessionId}`)
            .then((res) => res.json())
            .then((data) => {
              setAiRecommendations(data);
              setLastUpdated(new Date());
              setIsLoadingRec(false);
            })
            .catch((err) => {
              console.error("Recommendations fetch error:", err);
              setIsLoadingRec(false);
            });
        }
      }
    };

   fetchRecommendations();

// Removed interval to prevent API rate limit

return () => {};
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideVisible(false);
      setTimeout(() => {
        setCurrentRecIndex(prev => (prev + 1) % recCategories.length);
        setSlideVisible(true);
      }, 200);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);
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
  onClick={() => navigate("/cart")}
>
  🛒 Cart ({cart.reduce((a,b)=>a+b.quantity,0)})
</button>
      </div>

      <div style={styles.recommendBox}>
        <h2 style={styles.heading}>Recommended For You</h2>

        {(aiRecommendations.orders?.length > 0 || aiRecommendations.weather?.length > 0 || aiRecommendations.time?.length > 0) && (
          <div style={{minHeight: "80px", overflow: "hidden"}}>
            <div style={{ opacity: slideVisible ? 1 : 0, transform: slideVisible ? 'translateX(0)' : 'translateX(10px)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
              <div style={styles.recommendCategory}>
                <h3 style={styles.categoryLabel}>
                  {recCategories[currentRecIndex] === 'weather' ? '☀️ Weather Recommendations' :
                   recCategories[currentRecIndex] === 'time' ? '⏰ Time-Based Suggestions' :
                   '📜 Order-History Suggestion'}
                </h3>
                {aiRecommendations[recCategories[currentRecIndex]] && aiRecommendations[recCategories[currentRecIndex]].length > 0 ? (
                  aiRecommendations[recCategories[currentRecIndex]].map((item) => (
                    <div key={item._id} style={styles.recItem}>
                      <span>{item.name} - ₹{item.price}</span>
                      <button style={styles.button} onClick={() => addToCart(item)}>Add</button>
                    </div>
                  ))
                ) : (
                  <div style={styles.recItem}>No recommendations available for this category.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {categoryList.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "white", fontSize: "18px" }}>
          No menu items available. Please check the backend or seed data.
        </div>
      ) : (
        <div style={styles.menuColumns}>

          <div style={styles.menuBox}>

            {leftColumn.map((category) => (

              <div key={category.name} style={styles.category}>

                <h3 style={styles.categoryTitle}>
                  {category.name}
                </h3>

                {filterItems(category.items).map((item) => (

                  <div key={item._id} style={styles.menuItem}>

  <div>
    <div>{item.name}</div>
    {item.desc && <small style={{opacity:0.7}}>{item.desc}</small>}
  </div>

  <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
    
    <span>₹{item.price}</span>

    <button
      style={styles.button}
      onClick={() => addToCart(item)}
    >
      Add
    </button>

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

                <div key={item._id} style={styles.menuItem}>

  <div>
    <div>{item.name}</div>
    {item.desc && <small style={{opacity:0.7}}>{item.desc}</small>}
  </div>

  <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
    
    <span>₹{item.price}</span>

    <button
      style={styles.button}
      onClick={() => addToCart(item)}
    >
      Add
    </button>

  </div>

</div>

              ))}

            </div>

          ))}

        </div>

      </div>
      )}

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
padding:"50px",
borderRadius:"12px",
background:"rgba(0,0,0,0.25)",
marginBottom:"35px",
boxShadow:"0 10px 30px rgba(0,0,0,0.65)",
width:"100%",
minHeight:"auto",
height:"auto",
transition:"all 0.25s ease"
},

heading:{
fontSize:"24px",
marginBottom:"25px",
fontWeight:"bold"
},

recommendCategory:{
marginBottom:"20px"
},

categoryLabel:{
fontSize:"14px",
color:"#d4af37",
marginBottom:"10px",
fontWeight:"bold",
letterSpacing:"0.5px"
},

recItem:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 24px",
marginBottom:"12px",
background:"rgba(255,255,255,0.03)",
borderRadius:"6px",
fontSize:"16px",
borderLeft:"3px solid #d4af37",
height:"60px",
minHeight:"60px"
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

button:{
background:"#d4af37",
border:"none",
padding:"6px 12px",
borderRadius:"6px",
cursor:"pointer"
}

};

// Add slide animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideInSmooth {
    0% {
      opacity: 0;
      transform: translateX(80px);
    }
    12% {
      opacity: 1;
      transform: translateX(0);
    }
    88% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-80px);
    }
  }
  
  @keyframes slideOutSmooth {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    60% {
      opacity: 0.6;
    }
    100% {
      opacity: 0;
      transform: translateY(-15px);
    }
  }
  
  @keyframes slideOut {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  
  @keyframes slideIn {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
if (!document.head.querySelector("style[data-slide]")) {
  styleSheet.setAttribute("data-slide", "true");
  document.head.appendChild(styleSheet);
}

export default Menu;
