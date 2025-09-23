import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("You must be logged in to view your profile.");
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/users/me/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        setUser(userRes.data);
        setUsername(userRes.data.username);
        setBio(userRes.data.bio || "");

        const postsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/?author=${userRes.data.id}`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error fetching profile or posts:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("auth_token");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    if (profilePicFile) {
      formData.append("avatar", profilePicFile);
    }

    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/me/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser(res.data);
      setEditMode(false);
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/default-avatar.png"; // Default fallback
    return avatar.startsWith("http")
      ? avatar
      : `${process.env.NEXT_PUBLIC_API_URL}${avatar}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p className="error">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>My Profile</h1>

        {user && (
          <div className="profile">
            <img
              src={getAvatarUrl(user.avatar)}
              alt="Profile"
              className="profile-pic"
            />

            {!editMode ? (
              <>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}
                <button onClick={() => setEditMode(true)}>Edit Profile</button>
              </>
            ) : (
              <form onSubmit={handleProfileUpdate} encType="multipart/form-data">
                <div>
                  <label>Username: </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Bio: </label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label>Profile Picture: </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files[0])}
                  />
                </div>

                <p><strong>Email:</strong> {user.email}</p>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        <h2>My Posts</h2>
        {posts.length === 0 ? (
          <p>You haven’t posted anything yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              {post.image && (
                <img src={post.image} alt="Post" className="post-image" />
              )}
              <p>{post.content}</p>
              <p className="small">Likes: {post.likes_count}</p>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .profile {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 2rem;
          color: #333;
        }

        /* Dark mode for profile */
        :global(body.dark) .profile {
          background-color: #1e1e2f;
          color: #eee;
          border: 1px solid #333;
        }

        .profile-pic {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        input[type="text"],
        input[type="file"],
        textarea {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
          color: #333;
          background-color: white;
        }

        /* Dark mode form inputs */
        :global(body.dark) input[type="text"],
        :global(body.dark) input[type="file"],
        :global(body.dark) textarea {
          background-color: #2a2a3d;
          border: 1px solid #555;
          color: #eee;
        }

        textarea {
          resize: vertical;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          background-color: #0070f3;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background-color: #aaa;
        }

        button + button {
          margin-left: 0.5rem;
          background-color: #888;
        }

        .post-card {
          border: 1px solid #eee;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 8px;
        }

        /* Dark mode post card */
        :global(body.dark) .post-card {
          background-color: #1e1e2f;
          border-color: #333;
          color: #eee;
        }

        .post-image {
          max-width: 100%;
          height: auto;
          margin-top: 0.5rem;
        }

        .small {
          font-size: 0.85rem;
          color: #666;
        }

        /* Dark mode for small text */
        :global(body.dark) .small {
          color: #bbb;
        }
      `}</style>

    </>
  );
}
