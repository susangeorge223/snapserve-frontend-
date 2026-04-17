import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api";

export default function AdminSystemAvailability() {
  const [staffData, setStaffData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchStaffData = () => {
      console.log("📡 Fetching staff data from:", `${API_BASE}/api/kitchen-staff`);
      fetch(`${API_BASE}/api/kitchen-staff`)
        .then(res => {
          console.log("📡 Response status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("📊 Staff data received:", data);
          setStaffData(data);
        })
        .catch(err => console.error("❌ Error fetching staff data:", err));
    };

    const fetchHistory = () => {
      console.log("📡 Fetching history from:", `${API_BASE}/api/kitchen-staff/history`);
      fetch(`${API_BASE}/api/kitchen-staff/history`)
        .then(res => {
          console.log("📡 History response status:", res.status);
          return res.json();
        })
        .then(data => {
          console.log("📋 History data received:", data);
          setHistoryData(data);
        })
        .catch(err => console.error("❌ Error fetching history:", err));
    };

    fetchStaffData();
    fetchHistory();
    const interval = setInterval(() => {
      fetchStaffData();
      fetchHistory();
    }, 2000); // 2-second polling
    return () => clearInterval(interval);
  }, []);

  const activeStaffCount = staffData.filter(staff => staff.isLoggedIn).length;
  const totalStaffCount = staffData.length;

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (entryTime, exitTime) => {
    if (!entryTime) return "-";
    const start = new Date(entryTime);
    const end = exitTime ? new Date(exitTime) : new Date();
    const diff = Math.floor((end - start) / 1000); // seconds
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div style={styles.page}>
      <Link to="/admin">
        <button style={styles.backButton}>← Back to Admin Dashboard</button>
      </Link>

      <h1 style={styles.title}>System Availability</h1>

      <div style={styles.statsContainer}>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #4caf50` }}>
          <div style={styles.statLabel}>Active Staff</div>
          <div style={styles.statNumber}>{activeStaffCount}</div>
        </div>
        <div style={{ ...styles.statBox, borderLeft: `4px solid #2196F3` }}>
          <div style={styles.statLabel}>Total Staff</div>
          <div style={styles.statNumber}>{totalStaffCount}</div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={styles.tableTitle}>Kitchen Staff Activity</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: '8px 16px',
              background: showHistory ? '#d4af37' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: showHistory ? '#111' : 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showHistory ? '📋 Hide History' : '📋 Show History'}
          </button>
        </div>
        {staffData.length === 0 ? (
          <p style={styles.emptyText}>No staff records found</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={{ ...styles.tableCell, flex: 2, fontWeight: 'bold' }}>Staff Name</div>
              <div style={{ ...styles.tableCell, flex: 1.5, fontWeight: 'bold' }}>Status</div>
              <div style={{ ...styles.tableCell, flex: 2, fontWeight: 'bold' }}>Entry Time</div>
              <div style={{ ...styles.tableCell, flex: 2, fontWeight: 'bold' }}>Exit Time</div>
              <div style={{ ...styles.tableCell, flex: 1.5, fontWeight: 'bold' }}>Duration</div>
            </div>

            {staffData.map((staff) => (
              <div key={staff._id} style={{...styles.tableRow, background: staff.isLoggedIn ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0,0,0,0.1)'}}>
                <div style={{ ...styles.tableCell, flex: 2 }}>{staff.staffName || staff.staffUsername}</div>
                <div style={{ ...styles.tableCell, flex: 1.5 }}>
                  <span style={{
                    ...styles.statusBadge,
                    background: staff.isLoggedIn ? '#4caf50' : '#999'
                  }}>
                    {staff.isLoggedIn ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
                <div style={{ ...styles.tableCell, flex: 2 }}>{formatTime(staff.entryTime)}</div>
                <div style={{ ...styles.tableCell, flex: 2 }}>{formatTime(staff.exitTime)}</div>
                <div style={{ ...styles.tableCell, flex: 1.5 }}>
                  {formatDuration(staff.entryTime, staff.exitTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showHistory && (
        <div style={styles.tableContainer}>
          <h2 style={styles.tableTitle}>Login/Logout History</h2>
          {historyData.length === 0 ? (
            <p style={styles.emptyText}>No history records found</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div style={{ ...styles.tableCell, flex: 2, fontWeight: 'bold' }}>Staff Name</div>
                <div style={{ ...styles.tableCell, flex: 1.5, fontWeight: 'bold' }}>Action</div>
                <div style={{ ...styles.tableCell, flex: 2, fontWeight: 'bold' }}>Timestamp</div>
              </div>

              {historyData.map((record, idx) => (
                <div key={idx} style={{...styles.tableRow, background: record.action === 'login' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)'}}>
                  <div style={{ ...styles.tableCell, flex: 2 }}>{record.staffName}</div>
                  <div style={{ ...styles.tableCell, flex: 1.5 }}>
                    <span style={{
                      ...styles.statusBadge,
                      background: record.action === 'login' ? '#4caf50' : '#e05f5f'
                    }}>
                      {record.action === 'login' ? '🟢 Login' : '🔴 Logout'}
                    </span>
                  </div>
                  <div style={{ ...styles.tableCell, flex: 2 }}>
                    {new Date(record.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
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
  tableContainer: {
    background: 'rgba(0,0,0,0.25)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    overflowX: 'auto'
  },
  tableTitle: {
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
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    display: 'flex',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '8px 8px 0 0',
    padding: '12px',
    marginBottom: '8px',
    borderBottom: '2px solid rgba(212, 175, 55, 0.3)'
  },
  tableRow: {
    display: 'flex',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  tableCell: {
    padding: '0 12px',
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    whiteSpace: 'nowrap',
    display: 'inline-block'
  }
};