import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "../api";
function Cart({ cart, setCart }) {

  const [pressed, setPressed] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [estimatedTime, setEstimatedTime] = useState(null);

useEffect(() => {
  if (!estimatedTime || orderStatus === "ready") return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [estimatedTime, orderStatus]);

// Poll for order status
useEffect(() => {
  if (!orderId) return;

  const pollOrder = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`);
      if (response.ok) {
        const order = await response.json();
        setOrderStatus(order.status);
        if (order.estimatedTime && !estimatedTime) {
          setEstimatedTime(order.estimatedTime);
          setTimeLeft(order.estimatedTime * 60); // assuming minutes
        }
        if (order.status === "ready") {
          setTimeLeft(0); // stop the timer
        }
      }
    } catch (error) {
      console.error("Error polling order:", error);
    }
  };

  pollOrder();
  const interval = setInterval(pollOrder, 5000); // poll every 5 seconds

  return () => clearInterval(interval);
}, [orderId, estimatedTime]);

  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


const placeOrder = async () => {

  console.log("STEP 1: function started");  // 👈 ADD HERE

  try {

    const sessionId = localStorage.getItem("sessionId");

    console.log("STEP 2: sending request");  // 👈 ADD HERE

    console.log({
  sessionId,
  cart,
  total
});
    const response = await fetch(`${API_BASE}/api/orders`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    sessionId,
    items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
    totalAmount: total
  })
});

if (!response.ok) {
  const text = await response.text();
  console.error("Server error:", text);
  alert("Failed to place order. Please try again.");
  return;
}

const data = await response.json();
console.log("SUCCESS:", data);

setOrderPlaced(true);
setOrderId(data._id);
setCart([]);

  } catch (error) {
    console.error("ERROR:", error);
    alert("Failed to place order. Please try again.");
  }

};

 if (orderPlaced) {
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h1 style={styles.title}>Order Placed ✓</h1>

        <p style={{marginTop:"10px"}}>
          {orderStatus === "ready" ? "Your order is ready to serve!" : orderStatus === "accepted" ? "Kitchen accepted your order" : "Waiting for kitchen to accept"}
        </p>

        {orderStatus === "ready" ? (
          <h2 style={{marginTop:"30px", color: "green"}}>
            Ready to Serve
          </h2>
        ) : estimatedTime && orderStatus === "accepted" ? (
          <>
            <h2 style={{marginTop:"30px"}}>
              Estimated time
            </h2>

            <div style={styles.timer}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2,"0")}
            </div>

            <p style={{opacity:0.7}}>
              remaining
            </p>
          </>
        ) : null}

      </div>
    </div>
  );
}

  return (

    <div style={styles.page}>

      <div style={styles.container}>

        <h1 style={styles.title}>Your Cart</h1>

        {cart.map((item) => (

          <div key={item.name} style={styles.item}>

            <span>
              {item.name} x {item.quantity}
            </span>

            <span>
              ₹{item.price * item.quantity}
            </span>

          </div>

        ))}

        <div style={styles.divider}></div>

<div style={styles.totalRow}>
  <span>Total</span>
  <span>₹{total}</span>
</div>

        

        <button
  type="button"
  style={{
    ...styles.orderButton,
    transform: pressed ? "scale(0.96)" : "scale(1)",
    boxShadow: pressed
      ? "0 2px 6px rgba(0,0,0,0.4)"
      : "0 6px 16px rgba(0,0,0,0.5)"
  }}
  onMouseDown={() => setPressed(true)}
  onMouseUp={() => setPressed(false)}
  onMouseLeave={() => setPressed(false)}
  onClick={placeOrder}   // ✅ FIXED
>
  Place Order
</button>

        <button
          style={styles.backButton}
          onClick={() => navigate("/menu")}
        >
          Back to Menu
        </button>

      </div>

    </div>

  );
}

const styles = {

page:{
minHeight:"100vh",
background:  "linear-gradient(180deg,#0b1a13,#10271d)",
display:"flex",
justifyContent:"center",
alignItems:"center",
color:"white"
},

container:{
width:"520px",
background:"rgba(0,0,0,0.25)",
padding:"30px",
borderRadius:"12px"
},

title:{
marginBottom:"20px"
},

item:{
display:"flex",
justifyContent:"space-between",
padding:"12px",
marginBottom:"10px",
background:"rgba(255,255,255,0.05)",
borderRadius:"8px"
},

total:{
marginTop:"20px",
fontWeight:"bold",
fontSize:"18px"
},

orderButton:{
marginTop:"20px",
width:"100%",
padding:"12px",
background:"#d4af37",
border:"none",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold",
transition:"all 0.15s ease"
},

timer:{
fontSize:"48px",
fontWeight:"bold",
marginTop:"10px",
color:"#d4af37"
},

backButton:{
marginTop:"10px",
width:"100%",
padding:"10px",
background:"transparent",
border:"1px solid rgba(255,255,255,0.3)",
color:"white",
borderRadius:"8px",
cursor:"pointer"
},

divider:{
  marginTop:"15px",
  marginBottom:"15px",
  borderBottom:"2px solid rgba(255,255,255,0.3)"
},

totalRow:{
  display:"flex",
  justifyContent:"space-between",
  fontSize:"20px",
  fontWeight:"bold"
}

};

export default Cart;