import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [connectionStatus, setConnectionStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    const checkConnection = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/health`,
          { signal: controller.signal },
        );

        const data = await response.json();

        setConnectionStatus(
          response.ok && data.snowflake === "connected"
            ? "connected"
            : "disconnected",
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setConnectionStatus("disconnected");
        }
      }
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">S</div>
        <span>
          Snow<span>lytics</span>
        </span>
      </div>

      <div className="sidebar-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="nav-item">
          <span>▦</span> Overview
        </NavLink>

        <NavLink to="/sales" className="nav-item">
          <span>▤</span> Sales
        </NavLink>

        <NavLink to="/analytics" className="nav-item">
          <span>◫</span> Analytics
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-status">
          <span className={`status-dot ${connectionStatus}`} />

          {connectionStatus === "checking" && "Checking Snowflake..."}
          {connectionStatus === "connected" && "Snowflake connected"}
          {connectionStatus === "disconnected" && "Snowflake disconnected"}
        </div>

        <div className="user-profile">
          <div className="avatar">P</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
