import { useEffect, useState } from "react";
import { API_BASE } from "../api";
import socket from "../socket";
import { Link } from "react-router-dom";

export default function AdminSalesOverview() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = () => {
      fetch(`${API_BASE}/api/orders`)
        .then(res => res.json())
        .then(data => setOrders(data))
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

    const interval = setInterval(fetchOrders, 10000); // 2-second polling fallback
    return () => {
      clearInterval(interval);
      socket.off('dataCreated', handleOrderEvent);
      socket.off('dataUpdated', handleOrderEvent);
      socket.off('stateChanged', handleOrderEvent);
    };
  }, []);

  const toggleExpanded = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'new':
        return '#ff6b6b'; // Red
      case 'accepted':
      case 'preparing':
        return '#ffa500'; // Orange
      case 'ready':
        return '#4caf50'; // Green
      case 'completed':
        return '#2196F3'; // Blue
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'Pending';
      case 'accepted':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'new').length;
  const preparingCount = orders.filter(o => o.status === 'accepted').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;
  const completedCount = orders.filter(o => {
    if (o.status !== 'completed') return false;
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const dailyRevenue = orders
    .filter(o => {
      if (o.status !== 'completed') return false;
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const groupedOrders = {
    pending: orders.filter(o => o.status === 'pending' || o.status === 'new'),
    preparing: orders.filter(o => o.status === 'accepted'),
    ready: orders.filter(o => o.status === 'ready'),
    completed: orders.filter(o => {
      if (o.status !== 'completed') return false;
      
      // Filter to only show today's completed orders
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      
      return orderDate.toDateString() === today.toDateString();
    })
  };

  return (
    <div style={styles.page}>
      <Link to="/admin">
        <button style={styles.backButton}>← Back to Admin Dashboard</button>
      </Link>

      <h1 style={styles.title}>Sales Overview</h1>

      <div style={styles.statsContainer}>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #ff6b6b` }}>
          <div style={styles.statLabel}>Pending</div>
          <div style={styles.statNumber}>{pendingCount}</div>
        </div>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #ffa500` }}>
          <div style={styles.statLabel}>Preparing</div>
          <div style={styles.statNumber}>{preparingCount}</div>
        </div>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #4caf50` }}>
          <div style={styles.statLabel}>Ready</div>
          <div style={styles.statNumber}>{readyCount}</div>
        </div>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #2196F3` }}>
          <div style={styles.statLabel}>Completed</div>
          <div style={styles.statNumber}>{completedCount}</div>
        </div>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #d4af37` }}>
          <div style={styles.statLabel}>Daily Revenue</div>
          <div style={styles.statNumber}>₹{dailyRevenue.toFixed(2)}</div>
        </div>
      </div>

      <div style={styles.ordersGrid}>
        {/* Pending Orders */}
        <div style={styles.statusSection}>
          <h2 style={{ ...styles.sectionTitle, color: '#ff6b6b' }}>Pending ({pendingCount})</h2>
          {groupedOrders.pending.length === 0 ? (
            <p style={styles.emptyText}>No pending orders</p>
          ) : (
            groupedOrders.pending.map(order => (
              <OrderCard key={order._id} order={order} expanded={expandedOrders[order._id]} onToggle={() => toggleExpanded(order._id)} />
            ))
          )}
        </div>

        {/* Preparing Orders */}
        <div style={styles.statusSection}>
          <h2 style={{ ...styles.sectionTitle, color: '#ffa500' }}>Preparing ({preparingCount})</h2>
          {groupedOrders.preparing.length === 0 ? (
            <p style={styles.emptyText}>No orders being prepared</p>
          ) : (
            groupedOrders.preparing.map(order => (
              <OrderCard key={order._id} order={order} expanded={expandedOrders[order._id]} onToggle={() => toggleExpanded(order._id)} />
            ))
          )}
        </div>

        {/* Ready Orders */}
        <div style={styles.statusSection}>
          <h2 style={{ ...styles.sectionTitle, color: '#4caf50' }}>Ready ({readyCount})</h2>
          {groupedOrders.ready.length === 0 ? (
            <p style={styles.emptyText}>No ready orders</p>
          ) : (
            groupedOrders.ready.map(order => (
              <OrderCard key={order._id} order={order} expanded={expandedOrders[order._id]} onToggle={() => toggleExpanded(order._id)} />
            ))
          )}
        </div>

        {/* Completed Orders */}
        <div style={styles.statusSection}>
          <h2 style={{ ...styles.sectionTitle, color: '#2196F3' }}>Completed ({completedCount})</h2>
          {groupedOrders.completed.length === 0 ? (
            <p style={styles.emptyText}>No completed orders</p>
          ) : (
            groupedOrders.completed.map(order => (
              <OrderCard key={order._id} order={order} expanded={expandedOrders[order._id]} onToggle={() => toggleExpanded(order._id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, expanded, onToggle }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'new':
        return '#ff6b6b';
      case 'accepted':
      case 'preparing':
        return '#ffa500';
      case 'ready':
        return '#4caf50';
      case 'completed':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'Pending';
      case 'accepted':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdDate = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        ...styles.orderCard,
        borderLeft: `4px solid ${getStatusColor(order.status)}`
      }}
    >
      <div style={styles.orderHeader} onClick={onToggle}>
        <div style={styles.orderInfo}>
          <div style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</div>
          <div style={styles.orderTime}>{createdDate}</div>
        </div>
        <div style={styles.orderStats}>
          <span style={styles.itemCount}>{totalItems} items</span>
          <span style={{ ...styles.statusBadge, background: getStatusColor(order.status) }}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={styles.orderDetails}>
          <div style={styles.detailsSection}>
            <h4 style={styles.detailsTitle}>Items</h4>
            {order.items.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
                {item.price && <span>₹{(item.price * item.quantity).toFixed(2)}</span>}
              </div>
            ))}
          </div>

          <div style={styles.divider}></div>

          <div style={styles.detailsSection}>
            <div style={styles.totalRow}>
              <strong>Total:</strong>
              <strong>₹{order.totalAmount.toFixed(2)}</strong>
            </div>
            {order.estimatedTime && (
              <div style={styles.totalRow}>
                <strong>Est. Time:</strong>
                <strong>{order.estimatedTime} mins</strong>
              </div>
            )}
          </div>

          <div style={styles.divider}></div>

          <div style={styles.detailsSection}>
            <strong>Status: </strong>
            <span style={{ ...styles.statusBadge, background: getStatusColor(order.status) }}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px',
    background: 'linear-gradient(180deg, #0b1a13, #10271d)',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  },
  backButton: {
    marginBottom: '24px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  title: {
    marginBottom: '30px',
    fontSize: '32px',
    fontWeight: 'bold'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '40px'
  },
  statBox: {
    background: 'rgba(0,0,0,0.3)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.7,
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold'
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  statusSection: {
    background: 'rgba(0,0,0,0.25)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  sectionTitle: {
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  emptyText: {
    opacity: 0.6,
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px'
  },
  orderCard: {
    background: 'rgba(255,255,255,0.05)',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  orderId: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  orderTime: {
    fontSize: '12px',
    opacity: 0.6
  },
  orderStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemCount: {
    fontSize: '12px',
    opacity: 0.7,
    background: 'rgba(255,255,255,0.1)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white'
  },
  orderDetails: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  detailsSection: {
    marginBottom: '12px'
  },
  detailsTitle: {
    fontSize: '12px',
    opacity: 0.7,
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '6px 0',
    opacity: 0.9
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '12px 0'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    padding: '8px 0'
  }
};