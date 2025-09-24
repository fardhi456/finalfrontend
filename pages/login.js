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

      const data = err.response?.data;

      if (typeof data === "string") {
        setError(data);
      } else if (typeof data === "object" && data !== null) {
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
            autoComplete="email"
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
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

      <style jsx>{`
        :root {
          --bg-color: #fff;
          --text-color: #333;
          --input-border: #ccc;
          --input-bg: #f9f9f9;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg-color: #1f1f1f;
            --text-color: #f1f1f1;
            --input-border: #444;
            --input-bg: #333;
          }
        }

        .auth-container {
          max-width: 400px;
          margin: 80px auto 0;
          padding: 1rem;
          background-color: var(--bg-color);
          color: var(--text-color);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s, color 0.3s;
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          font-weight: 700;
          font-size: 2rem;
          color: var(--text-color);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          border: 1.5px solid var(--input-border);
          padding: 1.5rem;
          border-radius: 10px;
          background-color: var(--input-bg);
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .auth-form input {
          padding: 0.6rem;
          border: 1px solid var(--input-border);
          border-radius: 4px;
          background-color: var(--bg-color);
          color: var(--text-color);
          transition: border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease;
        }

        .auth-form input:focus {
          border-color: #0070f3;
          outline: none;
          box-shadow: 0 0 5px #0070f3;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .auth-form button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
          font-weight: 600;
        }

        .auth-form button:hover {
          background: #005bb5;
        }

        .error-msg {
          color: #d32f2f;
          margin-top: 0.5rem;
          text-align: center;
          font-weight: 600;
        }

        .link {
          color: #0070f3;
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
