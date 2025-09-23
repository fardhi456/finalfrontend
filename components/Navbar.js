import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUsername(res.data.username);
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

  // Toggle mobile menu open/close
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Close menu on navigation link click
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/" passHref>
          <span className="logo-text">Campus Creatives</span>
        </Link>
      </div>

      {/* Desktop links */}
      <div className="links">
        {isLoggedIn && <span className="welcome-msg">Hello, {username}</span>}

        <Link href="/" passHref>
          <span
            onClick={handleLinkClick}
            className={router.pathname === "/" ? "active link" : "link"}
          >
            Home
          </span>
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/saved" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/saved" ? "active link" : "link"}
              >
                Saved Posts
              </span>
            </Link>
            <Link href="/create-post" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/create-post" ? "active link" : "link"}
              >
                Create Post
              </span>
            </Link>
            <Link href="/profile" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/profile" ? "active link" : "link"}
              >
                Profile
              </span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/login" ? "active link" : "link"}
              >
                Login
              </span>
            </Link>
            <Link href="/register" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/register" ? "active link" : "link"}
              >
                Register
              </span>
            </Link>
          </>
        )}

        <button className="dark-toggle" onClick={toggleDarkMode}>
          {darkMode ? "Dark" : "Light"}
        </button>
      </div>

      {/* Hamburger icon for mobile */}
      <div
        id="hamburger"
        className="hamburger"
        role="button"
        tabIndex={0}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
        onClick={toggleMobileMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMobileMenu();
          }
        }}
      />

      {/* Mobile menu */}
      <div
        id="mobileMenu"
        className={`mobile-menu${mobileMenuOpen ? " active" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        {isLoggedIn && <span className="welcome-msg">Hello, {username}</span>}

        <Link href="/" passHref>
          <span
            onClick={handleLinkClick}
            className={router.pathname === "/" ? "active link" : "link"}
          >
            Home
          </span>
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/saved" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/saved" ? "active link" : "link"}
              >
                Saved Posts
              </span>
            </Link>
            <Link href="/create-post" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/create-post" ? "active link" : "link"}
              >
                Create Post
              </span>
            </Link>
            <Link href="/profile" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/profile" ? "active link" : "link"}
              >
                Profile
              </span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/login" ? "active link" : "link"}
              >
                Login
              </span>
            </Link>
            <Link href="/register" passHref>
              <span
                onClick={handleLinkClick}
                className={router.pathname === "/register" ? "active link" : "link"}
              >
                Register
              </span>
            </Link>
          </>
        )}

        <button className="dark-toggle" onClick={() => {
          toggleDarkMode();
          setMobileMenuOpen(false);
        }}>
          {darkMode ? "Dark" : "Light"}
        </button>
      </div>
    </nav>
  );
}
