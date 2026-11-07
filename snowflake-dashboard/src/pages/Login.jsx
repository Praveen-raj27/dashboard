import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Login.css";

const API_URL =  import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Admin is selected by default to preserve the previous login behavior.
  const [loginRole, setLoginRole] = useState("user");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          rememberMe,
          loginRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to sign in. Please try again.");
      }

      const { token, user } = data;

      if (!token || !user) {
        throw new Error("Invalid response received from the server.");
      }

      // Validate the selected login role against the database role.
      if (user.role?.toLowerCase() !== loginRole) {
        throw new Error(`This account is not registered as ${loginRole}.`);
      }

      // Store authentication details only after validation.
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      const redirectPath = location.state?.from?.pathname || "/home";

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-orb login-orb-one"></div>
        <div className="login-orb login-orb-two"></div>
        <div className="login-grid"></div>
      </div>

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="brand-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 8h14l1 13H4L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              <path d="M9 13h.01" />
              <path d="M15 13h.01" />
            </svg>
          </div>

          <span className="brand-name">Snowpify</span>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-heading">
            {/* Login Role Tabs */}
            <div
              className="login-role-tabs"
              role="tablist"
              aria-label="Login type"
            >
              <button
                type="button"
                role="tab"
                aria-selected={loginRole === "user"}
                className={`login-role-tab ${loginRole === "user" ? "active" : ""}`}
                onClick={() => handleRoleChange("user")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
                User Login
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={loginRole === "admin"}
                className={`login-role-tab ${loginRole === "admin" ? "active" : ""}`}
                onClick={() => handleRoleChange("admin")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Admin Login
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <div className="login-input-wrapper">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="password-label">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <div className="login-input-wrapper">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 9 5 9 7s-1.5 3.2-3.5 4.7" />
                      <path d="M6.2 6.2C3.8 7.6 2 10 2 12c0 2 4 7 10 7 1 0 2-.2 2.9-.5" />
                    </svg>
                  ) : (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="remember-option">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <span>Remember me</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {loginRole === "admin" ? "Admin" : "User"}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
          {/* Register Section */}
          <div className="login-register-divider">
            <span>OR</span>
          </div>

          <div className="login-register">
            <p>New to Snowpify?</p>

            <Link
              to="/register"
              state={{ loginRole }}
              className={`register-button ${
                loginRole === "admin" ? "register-disabled" : ""
              }`}
              onClick={(e) => {
                if (loginRole === "admin") {
                  e.preventDefault();
                }
              }}
              aria-disabled={loginRole === "admin"}
              tabIndex={loginRole === "admin" ? -1 : 0}
            >
              Create an Account
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} Snowpify. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Login;
