import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow } from 'date-fns'; // Import date-fns for relative time

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
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/likes/`, {
          headers: { Authorization: `Token ${token}` },
        });
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
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/`, {
        headers: { Authorization: `Token ${token}` },
      });

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
      <main className="container">
        <h1>Posts Feed</h1>
        {posts.length === 0 && <p>No posts available yet.</p>}

        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <div className="author-box">
              <Link href={`/users/${post.author.id}`}>
                <div className="author-link">
                  <img
                    src={getAvatarUrl(post.author.avatar)}
                    alt="Avatar"
                    className="author-avatar"
                  />
                  <span>{post.author.username}</span>
                </div>
              </Link>
              <span className="post-time"> • {formatDate(post.created_at)}</span>
            </div>

            <h2>{post.title}</h2>

            {post.image && <img src={post.image} alt="Post" className="post-image" />}
            <p>{post.content}</p>

            <div className="button-row">
              <button
                className="like-btn"
                onClick={() => handleLike(post.id)}
              >
                {post.liked_by_user ? "💖" : "🤍"} {post.likes_count}
              </button>
              <button
                className="comment-btn"
                onClick={() => toggleComments(post.id)}
              >
                💬 Comment
              </button>
              <button
                className="save-btn"
                onClick={() => handleSave(post.id)}
              >
                🔖 Save
              </button>

              {currentUserId === post.author.id && (
                <>
                  <Link href={`/edit/${post.id}`}>
                    <button className="edit-btn">✏️ Edit</button>
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(post.id)}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}

              <button
                className="copy-btn"
                onClick={() => handleCopyUserProfile(post.author.id)}
              >
                👤 Copy User Profile
              </button>
              <button
                className="copy-btn"
                onClick={() => handleCopyImage(post.id)}
              >
                📷 Copy Image URL
              </button>
              <button
                className="copy-btn"
                onClick={() => handleCopyText(post.id)}
              >
                📋 Copy Text
              </button>
            </div>

            {openComments[post.id] && (
              <section className="comments-section">
                <h3>Comments</h3>
                {comments[post.id] && comments[post.id].length > 0 ? (
                  <ul>
                    {comments[post.id].map((comment) => (
                      <li key={comment.id}>
                        <strong>{comment.author.username}:</strong> {comment.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No comments yet.</p>
                )}

                <textarea
                  rows="2"
                  placeholder="Write a comment..."
                  value={newComment[post.id] || ""}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                />
                <button
                  className="comment-submit-btn"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  Post Comment
                </button>
              </section>
            )}
          </article>
        ))}
      </main>

      <ToastContainer />

      <style jsx>{`
        .post-card {
          background-color: #ffffff;
          border: 1px solid #ddd;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-radius: 10px;
          transition: background-color 0.3s ease, transform 0.3s ease;
          color: #222;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .post-card:hover {
          background-color: #fff7e6; /* Light cream on hover */
          transform: scale(1.01);
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .post-card {
            background-color: #333;
            color: #f0f0f0;
            border-color: #555;
            box-shadow: none;
          }

          .post-card:hover {
            background-color: #444;
            transform: scale(1.01);
          }

          .author-box {
            color: #ccc;
          }

          .post-time {
            color: #aaa;
          }

          .button-row button {
            background: #d18f00;
          }

          .button-row button:hover {
            background-color: #c07800;
          }

          .comments-section {
            background-color: #444;
          }

          .comments-section textarea {
            background-color: #555;
            color: white;
            border: 1px solid #666;
          }

          .comments-section button {
            background-color: #28a745;
          }

          .comments-section button:hover {
            background-color: #218838;
          }
        }

        .author-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 1rem;
          color: #444;
        }

        .author-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #0070f3;
          cursor: pointer;
        }

        .author-avatar {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .post-time {
          color: white;
          font-size: 0.9rem;
        }

        h2 {
          font-size: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
        }

        .post-image {
          max-width: 100%;
          height: auto;
          margin-bottom: 1rem;
          border-radius: 8px;
        }

        .button-row {
          margin-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .button-row button {
          padding: 0.6rem 1.2rem;
          background: #d18f00;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .button-row button:hover {
          background-color: #c07800;
        }

        .comment-submit-btn {
          background-color: #28a745;
          color: white;
          border-radius: 5px;
        }

        .comment-submit-btn:hover {
          background-color: #218838;
        }

        .comments-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
        }

        .comments-section ul {
          list-style: none;
          padding-left: 0;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .comments-section li {
          padding: 0.25rem 0;
          border-bottom: 1px solid #eee;
        }

        .comments-section textarea {
          width: 100%;
          resize: vertical;
          margin-bottom: 0.5rem;
          padding: 0.8rem;
          border-radius: 5px;
          border: 1px solid #ddd;
          background-color: #f9f9f9;
          font-size: 1rem;
          color: #222;
        }

        .comments-section button {
          padding: 0.6rem 1.5rem;
        }

        @media (max-width: 600px) {
          .button-row {
            gap: 0.5rem;
          }

          .comments-section button {
            width: 100%;
          }
        }
      `}</style>

    </>
  );
}
