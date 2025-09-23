import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/token/login/`,
        form
      );

      // Save token
      localStorage.setItem("auth_token", res.data.auth_token);
      router.push("/");
    } catch (err) {
      console.error(err.response?.data);

      // ✅ Extract error messages cleanly
      const data = err.response?.data;

      if (typeof data === "string") {
        setError(data);
      } else if (typeof data === "object" && data !== null) {
        // Get the first field with an error message
        const firstErrorKey = Object.keys(data)[0];
        const firstErrorValue = data[firstErrorKey];

        if (Array.isArray(firstErrorValue)) {
          setError(firstErrorValue[0]);
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don’t have an account?{" "}
          <Link href="/register" className="link">
            Register here
          </Link>
        </p>
      </div>

      {/* Optional basic styling */}
      <style jsx>{`
        .auth-container {
          max-width: 400px;
          margin: 80px auto 0;
          padding: 1rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .auth-form input {
          padding: 0.6rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .auth-form button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        .auth-form button:hover {
          background: #005bb5;
        }

        .error-msg {
          color: red;
          margin-top: 0.5rem;
          text-align: center;
        }

        .link {
          color: #0070f3;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
