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
          <span onClick={handleLinkClick} className={router.pathname === "/" ? "active link" : "link"}>Home</span>
        </Link>

        <Link href="/about" passHref>
          <span onClick={handleLinkClick} className={router.pathname === "/about" ? "active link" : "link"}>About Us</span>
        </Link>

        <Link href="/gallery" passHref>
          <span onClick={handleLinkClick} className={router.pathname === "/gallery" ? "active link" : "link"}>Gallery</span>
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/saved" passHref>
              <span onClick={handleLinkClick} className={router.pathname === "/saved" ? "active link" : "link"}>Saved Posts</span>
            </Link>

            <div className="dropdown">
              <span
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={router.pathname === "/create-post" ? "active link" : "link"}
              >
                Create Post ⌄
              </span>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link href="/create-post?type=artwork" passHref>
                    <span onClick={handleLinkClick}>🎨 Submit Artwork</span>
                  </Link>
                  <Link href="/create-post?type=writing" passHref>
                    <span onClick={handleLinkClick}>🖊️ Writing Hub</span>
                  </Link>
                  <Link href="/create-post?type=both" passHref>
                    <span onClick={handleLinkClick}>📝 Both</span>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/profile" passHref>
              <img src={avatarUrl} alt="User Avatar" className="avatar" onClick={handleLinkClick} />
            </Link>

            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" passHref>
              <span onClick={handleLinkClick} className={router.pathname === "/login" ? "active link" : "link"}>Login</span>
            </Link>
            <Link href="/register" passHref>
              <span onClick={handleLinkClick} className={router.pathname === "/register" ? "active link" : "link"}>Register</span>
            </Link>
          </>
        )}

        <button className="dark-toggle" onClick={toggleDarkMode}>
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Hamburger icon for mobile */}
      <div
        className="hamburger"
        role="button"
        tabIndex={0}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
        onClick={toggleMobileMenu}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleMobileMenu()}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileMenuOpen ? " active" : ""}`} aria-hidden={!mobileMenuOpen}>
        {isLoggedIn && <span className="welcome-msg">Hello, {username}</span>}
        
        <Link href="/" passHref><span onClick={handleLinkClick}>Home</span></Link>
        <Link href="/about" passHref><span onClick={handleLinkClick}>About Us</span></Link>
        <Link href="/gallery" passHref><span onClick={handleLinkClick}>Gallery</span></Link> {/* ✅ ADDED MISSING GALLERY LINK */}

        {isLoggedIn ? (
          <>
            <Link href="/saved" passHref><span onClick={handleLinkClick}>Saved Posts</span></Link>
            <Link href="/create-post?type=artwork" passHref><span onClick={handleLinkClick}>🎨 Submit Artwork</span></Link>
            <Link href="/create-post?type=writing" passHref><span onClick={handleLinkClick}>🖊️ Writing Hub</span></Link>
            <Link href="/create-post?type=both" passHref><span onClick={handleLinkClick}>📝 Both</span></Link>
            <Link href="/profile" passHref><img src={avatarUrl} alt="Avatar" className="avatar" onClick={handleLinkClick} /></Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" passHref><span onClick={handleLinkClick}>Login</span></Link>
            <Link href="/register" passHref><span onClick={handleLinkClick}>Register</span></Link>
          </>
        )}
        <button className="dark-toggle" onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}>
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Custom dropdown style */}
      <style jsx>{`
        .dropdown {
          position: relative;
          display: inline-block;
        }

        .dropdown > .link {
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .dropdown > .link:hover {
          background-color: #f0f0f0;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 180px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
          z-index: 1000;
          padding: 4px 0;
          margin-top: 4px;
        }

        .dropdown-menu span {
          display: block;
          padding: 10px 16px;
          font-size: 14px;
          color: #333;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .dropdown-menu span:hover {
          background-color: #f5f5f5;
        }

        .dropdown-menu span:active {
          background-color: #eaeaea;
        }

        /* Optional dark mode override */
        body.dark .dropdown-menu {
          background-color: #2b2b2b;
          border-color: #444;
        }

        body.dark .dropdown-menu span {
          color: #eee;
        }

        body.dark .dropdown-menu span:hover {
          background-color: #3a3a3a;
        }
      `}</style>
    </nav>
  );
}
