
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  let user = null;
  let token = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
    token = localStorage.getItem("token");
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  if (!user || !token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
