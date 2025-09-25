import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/me/`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => setCurrentUserId(res.data.id))
        .catch((err) => console.error("Error fetching user", err));
    }

    fetchPosts(token);
  }, []);

  const fetchPosts = async (token) => {
    try {
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/`,
        { headers }
      );
      setPosts(res.data);
      res.data.forEach((post) => fetchComments(post.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments/`
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch comments for post", postId, err);
    }
  };

  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return alert("Please log in to like posts");

    const post = posts.find((p) => p.id === postId);
    const userLiked = post.liked_by_user;

    try {
      if (userLiked) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/likes/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/likes/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked_by_user: !userLiked,
                likes_count: userLiked ? p.likes_count - 1 : p.likes_count + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Like/unlike failed", err);
    }
  };

  const handleDelete = async (postId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return alert("Please log in to delete posts");

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setPosts(posts.filter((post) => post.id !== postId));
      setComments((prev) => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSave = (postId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return alert("Please log in to save posts");

    const saved = JSON.parse(localStorage.getItem("saved_posts") || "[]");
    if (!saved.includes(postId)) {
      saved.push(postId);
      localStorage.setItem("saved_posts", JSON.stringify(saved));
      alert("Post saved!");
    } else {
      alert("Post already saved.");
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComment((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return alert("Please log in to comment");

    const content = newComment[postId];
    if (!content || content.trim() === "") return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments/`,
        { text: content },
        { headers: { Authorization: `Token ${token}` } }
      );
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/default-avatar.png";
    return avatar.startsWith("http")
      ? avatar
      : `${process.env.NEXT_PUBLIC_API_URL}${avatar}`;
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleCopyUserProfile = (userId) => {
    const profileUrl = `${window.location.origin}/users/${userId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success("User profile URL copied!");
    });
  };

  const handleCopyImage = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post.image) {
      navigator.clipboard.writeText(post.image).then(() => {
        toast.success("Image URL copied!");
      });
    } else {
      toast.error("No image available to copy.");
    }
  };

  const handleCopyText = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post.content) {
      navigator.clipboard.writeText(post.content).then(() => {
        toast.success("Text copied!");
      });
    } else {
      toast.error("No text available to copy.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          📢 Posts Feed
        </h1>

        {posts.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No posts available yet.</p>
        )}

        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 mb-6"
          >
            {/* Author */}
            <div className="flex items-center justify-between mb-4">
              <Link href={`/users/${post.author.id}`} className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(post.author.avatar)}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                  {post.author.username}
                </span>
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              {post.title}
            </h2>

            {/* Image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full rounded-xl mb-4 shadow-sm"
              />
            )}

            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {post.content}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => handleLike(post.id)}
                className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium transition"
              >
                {post.liked_by_user ? "💖" : "🤍"} {post.likes_count}
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
              >
                💬 Comment
              </button>
              <button
                onClick={() => handleSave(post.id)}
                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition"
              >
                🔖 Save
              </button>

              {currentUserId === post.author.id && (
                <>
                  <Link href={`/edit/${post.id}`}>
                    <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition">
                      ✏️ Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}

              <button
                onClick={() => handleCopyUserProfile(post.author.id)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition"
              >
                👤 Copy User Profile
              </button>
              <button
                onClick={() => handleCopyImage(post.id)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition"
              >
                📷 Copy Image URL
              </button>
              <button
                onClick={() => handleCopyText(post.id)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition"
              >
                📋 Copy Text
              </button>
            </div>

            {/* Comments */}
            {openComments[post.id] && (
              <section className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">
                  Comments
                </h3>

                {comments[post.id] && comments[post.id].length > 0 ? (
                  <ul className="space-y-2 mb-3">
                    {comments[post.id].map((comment) => (
                      <li
                        key={comment.id}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200"
                      >
                        <strong>{comment.author.username}:</strong> {comment.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mb-3">No comments yet.</p>
                )}

                <textarea
                  rows="2"
                  placeholder="Write a comment..."
                  value={newComment[post.id] || ""}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                />
                <button
                  onClick={() => handleCommentSubmit(post.id)}
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition"
                >
                  Post Comment
                </button>
              </section>
            )}
          </article>
        ))}
      </main>

      <ToastContainer />
    </>
  );
}
