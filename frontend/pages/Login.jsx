import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { toast } from "react-toastify";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple Email Regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errMsg = "Please enter a valid email address.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (password.length < 6) {
      const errMsg = "Security Password must be at least 6 characters long.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success("Welcome back to your TripVault!");
      navigate("/dashboard");
    } else {
      setError(res.message);
      toast.error(res.message || "Failed to establish secure session.");
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="glass-card auth-card animate-slide">
        <div className="auth-header">
          <div className="auth-logo">TRIPVAULT</div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Secure Access Portal for Elite Travel
          </p>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            border: "1px solid var(--error)",
            padding: "0.75rem",
            borderRadius: "8px",
            color: "var(--error)",
            fontSize: "0.85rem",
            marginBottom: "1rem"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@luxurytravel.com"
            required
          />

          <Input
            label="Security Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem", gap: "0.5rem" }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                Connecting...
              </>
            ) : (
              <>
                Access Vault <LogIn size={16} />
              </>
            )}
          </Button>
        </form>

        <div className="auth-footer">
          Don't have credentials?{" "}
          <Link to="/register" className="auth-link">
            Request Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
