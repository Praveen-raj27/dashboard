import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setSuccess(data.message);
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
          <Mail size={27} />
        </div>

        <div className="recovery-heading">
          <h1>Forgot Password?</h1>
          <p>
            Enter your registered email address and we'll send you a
            link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="recovery-field">
            <label htmlFor="recovery-email">Email address</label>

            <div className="recovery-input-wrapper">
              <Mail size={19} />

              <input
                id="recovery-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {error && (
            <div className="recovery-message error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="recovery-message success" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="recovery-submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="recovery-security">
          <ShieldCheck size={16} />
          <span>Your password reset link expires in 15 minutes.</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;