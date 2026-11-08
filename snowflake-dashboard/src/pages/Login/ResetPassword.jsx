import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset your password.");
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recovery-page">
      <div className="recovery-card">
        <Link to="/login" className="recovery-back">
          <ArrowLeft size={17} />
          Back to Login
        </Link>

        <div className="recovery-icon">
          <Lock size={27} />
        </div>

        <div className="recovery-heading">
          <h1>Reset Password</h1>
          <p>
            Create a new password for your Snowpify account.
          </p>
        </div>

        {success ? (
          <div className="reset-success">
            <div className="recovery-message success" role="status">
              Your password has been reset successfully.
            </div>

            <Link to="/login" className="recovery-submit recovery-login-link">
              Continue to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="recovery-field">
              <label htmlFor="new-password">New Password</label>

              <div className="recovery-input-wrapper">
                <Lock size={19} />

                <input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="recovery-field">
              <label htmlFor="confirm-password">
                Confirm New Password
              </label>

              <div className="recovery-input-wrapper">
                <Lock size={19} />

                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="recovery-message error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="recovery-submit"
              disabled={loading || !token}
            >
              {loading ? "Updating Password..." : "Reset Password"}
              {!loading && <span>→</span>}
            </button>
          </form>
        )}

        <div className="recovery-security">
          <ShieldCheck size={16} />
          <span>Use a password with at least 8 characters.</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;