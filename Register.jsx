import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { UserPlus, AlertCircle } from "lucide-react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    const res = await register(fullName, email, password);
    setSubmitting(false);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="glass-card auth-card animate-slide">
        <div className="auth-header">
          <div className="auth-logo">TRIPVAULT</div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Register Credentials to Access the Vault
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
            label="Full Name"
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />

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
            placeholder="Min. 6 characters"
            required
          />

          <Button
            type="submit"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Establish Account"} <UserPlus size={16} />
          </Button>
        </form>

        <div className="auth-footer">
          Already have credentials?{" "}
          <Link to="/login" className="auth-link">
            Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
