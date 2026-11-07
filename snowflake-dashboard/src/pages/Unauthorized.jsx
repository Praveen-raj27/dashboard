import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="unauthorized">
      <h1>403 - Access Denied</h1>
      <p>You don't have permission to access this page.</p>

      <Link to="/login">Go to Login</Link>
    </div>
  );
}

export default Unauthorized;