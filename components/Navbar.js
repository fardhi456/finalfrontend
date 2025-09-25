import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails(token);
    }

    const darkPref = localStorage.getItem("dark_mode");
    if (darkPref === "true") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  const fetchUserDetails = async (token) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/me/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setUsername(res.data.username);
      if (res.data.avatar) {
        setAvatarUrl(res.data.avatar);
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const handleLogout = () => {
    const confirmLogout = confirm("Do you really want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setUsername("");
    setMobileMenuOpen(false);
    router.push("/");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("dark_mode", newMode.toString());
    if (newMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={handleLinkClick}
              aria-label="Campus Creatives Home"
              className="flex items-center gap-2 select-none"
            >
              <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400">
                Campus Creatives
              </span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {isLoggedIn && (
              <p className="text-sm text-gray-700 dark:text-gray-300 pr-2">Hello, {username}</p>
            )}

            <Link
              href="/"
              onClick={handleLinkClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                router.pathname === "/"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Home
            </Link>

            <Link
              href="/about"
              onClick={handleLinkClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                router.pathname === "/about"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              About Us
            </Link>

            <Link
              href="/gallery"
              onClick={handleLinkClick}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                router.pathname === "/gallery"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Gallery
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/saved"
                  onClick={handleLinkClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    router.pathname === "/saved"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Saved Posts
                </Link>

                {/* Create Post dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((d) => !d)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      router.pathname === "/create-post" || router.pathname.startsWith("/create-post")
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    aria-expanded={dropdownOpen}
                  >
                    Create Post
                    <svg
                      className={`w-3 h-3 transform ${dropdownOpen ? "-rotate-180" : "rotate-0"} transition-transform duration-150`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/create-post?type=artwork"
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🎨 Submit Artwork
                      </Link>
                      <Link
                        href="/create-post?type=writing"
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🖊️ Writing Hub
                      </Link>
                      <Link
                        href="/create-post?type=both"
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        📝 Both
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/profile"
                  onClick={handleLinkClick}
                  className="ml-2"
                >
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-indigo-400 object-cover"
                  />
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    router.pathname === "/login"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={handleLinkClick}
                  className={`ml-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    router.pathname === "/register"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Register
                </Link>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
              aria-label="Toggle dark mode"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Open main menu"
              className="p-2 inline-flex items-center justify-center rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          mobileMenuOpen ? "max-h-screen" : "max-h-0"
        } md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800`}
      >
        <div className="px-4 pt-4 pb-6 space-y-3">
          {isLoggedIn && <p className="text-sm text-gray-700 dark:text-gray-300">Hello, {username}</p>}

          <Link
            href="/"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Home
          </Link>

          <Link
            href="/about"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            About Us
          </Link>

          <Link
            href="/gallery"
            onClick={handleLinkClick}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Gallery
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/saved"
                onClick={handleLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Saved Posts
              </Link>

              <Link
                href="/create-post?type=artwork"
                onClick={handleLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                🎨 Submit Artwork
              </Link>

              <Link
                href="/create-post?type=writing"
                onClick={handleLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                🖊️ Writing Hub
              </Link>

              <Link
                href="/create-post?type=both"
                onClick={handleLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                📝 Both
              </Link>

              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={handleLinkClick}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}

          <button
            onClick={() => {
              toggleDarkMode();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}
