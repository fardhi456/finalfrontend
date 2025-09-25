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
    if (!avatar) return "/default-avatar.png";
    return avatar.startsWith("http")
      ? avatar
      : `${process.env.NEXT_PUBLIC_API_URL}${avatar}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-red-500 font-medium">{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          My Profile
        </h1>

        {user && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mb-10 flex flex-col items-center md:items-start gap-6">
            <img
              src={getAvatarUrl(user.avatar)}
              alt="Profile"
              className="w-28 h-28 object-cover rounded-full ring-4 ring-blue-500 shadow-md"
            />

            {!editMode ? (
              <div className="w-full space-y-3">
                <p className="text-lg text-gray-800 dark:text-gray-200">
                  <strong>Username:</strong> {user.username}
                </p>
                <p className="text-lg text-gray-800 dark:text-gray-200">
                  <strong>Email:</strong> {user.email}
                </p>
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Bio:</strong> {user.bio}
                  </p>
                )}
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleProfileUpdate}
                encType="multipart/form-data"
                className="w-full space-y-5"
              >
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Bio:
                  </label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    className="w-full px-3 py-2 border rounded-lg resize-y dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Profile Picture:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicFile(e.target.files[0])}
                    className="w-full text-gray-700 dark:text-gray-300"
                  />
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> {user.email}
                </p>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition disabled:bg-gray-400"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow transition disabled:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          My Posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            You haven’t posted anything yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 hover:shadow-lg transition flex flex-col"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {post.title}
                </h3>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="rounded-lg mb-3 w-full h-40 object-cover"
                  />
                )}
                <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-2">
                  {post.content}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto">
                  Likes: {post.likes_count}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
