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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 sm:p-10 transition-colors duration-300">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            Register
          </h1>

          {success ? (
            <p className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-center py-3 px-4 rounded-lg font-semibold">
              ✅ Registration successful! Please wait for admin approval.
            </p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Your username"
                    required
                    autoComplete="username"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email..."
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  />
                </div>

                {error && (
                  <p className="text-red-600 dark:text-red-400 text-center font-medium">
                    ❌ {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Register
                </button>
              </form>

              <p className="text-center text-gray-700 dark:text-gray-300 mt-6 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
