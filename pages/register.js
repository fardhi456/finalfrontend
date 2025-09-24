import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/register/`,
        form
      );
      console.log(res.data);
      setSuccess(true);
    } catch (err) {
      console.error(err.response?.data);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        if (Array.isArray(val)) {
          setError(val[0]);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h1>Register</h1>
        {success ? (
          <p className="success-msg">
            ✅ Registration successful! Please wait for admin approval.
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="submit">Register</button>
              {error && <p className="error-msg">❌ {error}</p>}
            </form>
            <p className="switch-msg">
              Already have an account?{" "}
              <Link href="/login" className="link">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        :root {
          --bg-color: #ffffff;
          --text-color: #1f1f1f;
          --input-bg: #f9f9f9;
          --input-border: #ccc;
          --input-placeholder: #888;
          --button-bg: #0070f3;
          --button-hover-bg: #005bb5;
          --error-color: #d32f2f;
          --success-color: #2e7d32;
          --link-color: #0070f3;
          --shadow: rgba(0, 0, 0, 0.1);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg-color: #121212;
            --text-color: #e0e0e0;
            --input-bg: #2f2f2f;
            --input-border: #555;
            --input-placeholder: #aaa;
            --button-bg: #2196f3;
            --button-hover-bg: #1e88e5;
            --error-color: #ef5350;
            --success-color: #81c784;
            --link-color: #64b5f6;
            --shadow: rgba(0, 0, 0, 0.6);
          }
        }

        .auth-container {
          max-width: 420px;
          margin: 80px auto;
          padding: 2rem;
          background-color: var(--bg-color);
          color: var(--text-color);
          border-radius: 10px;
          box-shadow: 0 6px 16px var(--shadow);
          transition: background-color 0.3s, color 0.3s;
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: var(--text-color);
          font-weight: 700;
          font-size: 2rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 1.5px solid var(--input-border);
          padding: 1.5rem;
          border-radius: 10px;
          background-color: var(--input-bg);
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .auth-form input {
          padding: 0.75rem;
          background-color: var(--bg-color);
          color: var(--text-color);
          border: 1.5px solid var(--input-border);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease, background-color 0.3s;
        }

        .auth-form input::placeholder {
          color: var(--input-placeholder);
          opacity: 1;
          font-style: italic;
        }

        .auth-form input:focus {
          border-color: var(--button-bg);
          outline: none;
          box-shadow: 0 0 5px var(--button-bg);
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .auth-form button {
          background: var(--button-bg);
          color: white;
          border: none;
          padding: 0.85rem;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.25s ease-in-out, box-shadow 0.25s;
          font-weight: 600;
        }

        .auth-form button:hover,
        .auth-form button:focus {
          background: var(--button-hover-bg);
          box-shadow: 0 0 10px var(--button-hover-bg);
          outline: none;
        }

        .error-msg {
          color: var(--error-color);
          margin-top: 0.5rem;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .success-msg {
          color: var(--success-color);
          background-color: rgba(76, 175, 80, 0.1);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-size: 1rem;
          margin-top: 1rem;
          font-weight: 600;
        }

        .switch-msg {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.95rem;
        }

        .link {
          color: var(--link-color);
          text-decoration: underline;
          font-weight: 600;
        }

        p {
          color: var(--text-color);
        }
      `}</style>
    </>
  );
}
