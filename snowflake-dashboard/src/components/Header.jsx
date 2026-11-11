import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const user = getUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  const firstLetter = user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <div className="app-header-brand-icon">S</div>
        <span>Snowpify</span>
      </div>

      {/* Customer navigation */}
      <nav className="app-header-nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `app-header-nav-link ${isActive ? "active" : ""}`
          }
        >
          Shop
        </NavLink>

        <NavLink
          to="/my-orders"
          className={({ isActive }) =>
            `app-header-nav-link ${isActive ? "active" : ""}`
          }
        >
          My Orders
        </NavLink>
      </nav>

      <div className="app-header-profile" ref={dropdownRef}>
        <button
          type="button"
          className={`profile-trigger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="profile-avatar">{firstLetter}</div>

          <div className="profile-user-info">
            <span className="profile-user-name">{user.name || "User"}</span>
            <span className="profile-user-role">{user.role || "User"}</span>
          </div>

          <span className={`profile-chevron ${isOpen ? "rotated" : ""}`}>
            ▾
          </span>
        </button>

        {isOpen && (
          <div className="profile-dropdown">
            <div className="dropdown-user-info">
              <div className="profile-avatar dropdown-avatar">
                {firstLetter}
              </div>

              <div>
                <strong>{user.name || "User"}</strong>
                <span>{user.email || ""}</span>
              </div>
            </div>

            <div className="dropdown-divider" />

            <button
              type="button"
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <span className="dropdown-item-icon">↪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
