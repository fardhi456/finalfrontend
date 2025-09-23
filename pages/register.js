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
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h1>Register</h1>
        {success ? (
          <p className="success-msg">
            Registration successful! Please wait for admin approval.
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
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="submit">Register</button>
              {error && <p className="error-msg">{error}</p>}
            </form>
            <p>
              Already have an account?{" "}
              <Link href="/login" className="link">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}
