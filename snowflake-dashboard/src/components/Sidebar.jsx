import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">S</div>
        <span>Snow<span>lytics</span></span>
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
          <span className="status-dot"></span>
          Snowflake connected
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