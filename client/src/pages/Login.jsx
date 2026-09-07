import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "@/components/PasswordInput.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
            window.scrollTo(0, 0);
        }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-2xl font-800 text-ink">Welcome back</h1>
      <p className="mb-8 text-muted">Log in to continue shopping.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <PasswordInput
            required
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
