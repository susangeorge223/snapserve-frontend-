import { useEffect, useState } from "react";
import { API_BASE } from "../api";
import socket from "../socket";
import { Link } from "react-router-dom";

export default function KitchenOrders(){
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState({});
  const [expandedOrders, setExpandedOrders] = useState(true);

  useEffect(()=>{
    const fetchOrders = () => {
      fetch(`${API_BASE}/api/orders`)
        .then(res=>res.json())
        .then(data=>setOrders(data))
        .catch(err => console.error("Error fetching orders:", err));
    };

    fetchOrders();

    const handleOrderEvent = (payload) => {
      if (!payload || payload.resource !== 'order') return;
      fetchOrders();
    };

    socket.on('dataCreated', handleOrderEvent);
    socket.on('dataUpdated', handleOrderEvent);
    socket.on('stateChanged', handleOrderEvent);

    const interval = setInterval(fetchOrders, 10000);
    return () => {
      clearInterval(interval);
      socket.off('dataCreated', handleOrderEvent);
      socket.off('dataUpdated', handleOrderEvent);
      socket.off('stateChanged', handleOrderEvent);
    };
  }, []);

  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" })
      });
      if (response.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: "accepted" } : o));
        setAcceptedOrders({ ...acceptedOrders, [orderId]: { estimatedTime: null, sent: false } });
      }
    } catch (err) {
      console.error("Accept order failed", err);
    }
  };

  const setEstimatedTime = (orderId, time) => {
    setAcceptedOrders({ ...acceptedOrders, [orderId]: { ...acceptedOrders[orderId], estimatedTime: time } });
  };

  const sendTime = async (orderId) => {
    const time = acceptedOrders[orderId]?.estimatedTime;
    if (!time) return;
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedTime: time })
      });
      if (response.ok) {
        setAcceptedOrders({ ...acceptedOrders, [orderId]: { ...acceptedOrders[orderId], sent: true } });
      }
    } catch (err) {
      console.error("Send time failed", err);
    }
  };

  const serveOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" })
      });
      if (response.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: "ready" } : o));
      }
    } catch (err) {
      console.error("Serve order failed", err);
    }
  };

  const completeOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
      });
      if (response.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: "completed" } : o));
      }
    } catch (err) {
      console.error("Complete order failed", err);
    }
  };

  const newOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'new').length;

  return (
    <div style={{ padding: "30px" }}>
      <Link to="/kitchen">
        <button style={{ marginBottom: "16px", padding: "8px 12px" }}>← Back to Kitchen Dashboard</button>
      </Link>
      <h1>Kitchen Orders</h1>
      <h3>New orders: {newOrdersCount}</h3>

      {orders.filter(o => o.status !== 'completed').length === 0 && <p>No active orders currently.</p>}

      {orders.filter(o => o.status !== 'completed').map(order => (
        <div key={order._id} style={{ border: "1px solid #ccc", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
          <div><strong>Order ID:</strong> {order._id}</div>
          {order.items.map(item => (
            <div key={item.name}>{item.name} x {item.quantity}</div>
          ))}
          <div><strong>Status:</strong> {order.status}</div>

          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            {(order.status === 'pending' || order.status === 'new') && (
              <>
                <button onClick={() => acceptOrder(order._id)} style={{ background: "blue", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Accept</button>
                <button onClick={() => completeOrder(order._id)} style={{ background: "red", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Completed</button>
              </>
            )}
            {order.status === 'accepted' && !acceptedOrders[order._id]?.sent && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  placeholder="Est. time"
                  onChange={(e) => setEstimatedTime(order._id, parseInt(e.target.value))}
                  style={{ padding: "6px" }}
                />
                <button onClick={() => sendTime(order._id)} style={{ background: "orange", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Send Time</button>
              </div>
            )}
            {order.status === 'accepted' && acceptedOrders[order._id]?.sent && (
              <>
                <button onClick={() => serveOrder(order._id)} style={{ background: "purple", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Serve</button>
                <button onClick={() => completeOrder(order._id)} style={{ background: "green", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Completed</button>
              </>
            )}
            {order.status === 'ready' && (
              <button onClick={() => completeOrder(order._id)} style={{ background: "green", color: "white", padding: "6px 10px", border: "none", borderRadius: "5px" }}>Completed</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
