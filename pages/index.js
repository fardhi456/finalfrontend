import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Link from "next/link";

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
    return date.toLocaleString();
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

            <button className="like-btn" onClick={() => handleLike(post.id)}>
              {post.liked_by_user ? "💖" : "🤍"} {post.likes_count}
            </button>

            <div className="button-row">
              <button onClick={() => toggleComments(post.id)}>💬 Comment</button>
              <button onClick={() => handleSave(post.id)}>🔖 Save</button>
              {currentUserId === post.author.id && (
                <>
                  <Link href={`/edit/${post.id}`}>
                    <button>✏️ Edit</button>
                  </Link>
                  <button onClick={() => handleDelete(post.id)}>🗑️ Delete</button>
                </>
              )}
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
                <button onClick={() => handleCommentSubmit(post.id)}>Post Comment</button>
              </section>
            )}
          </article>
        ))}
      </main>

      <style jsx>{`
        .post-card {
          border: 1px solid #eee;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
        }

        .author-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          color: #555;
        }

        .author-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #0070f3;
          cursor: pointer;
        }

        .author-avatar {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .post-time {
          color: #777;
          font-size: 0.85rem;
        }

        .like-btn,
        .button-row button {
          padding: 0.4rem 0.8rem;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          transition: 0.2s;
        }

        .like-btn:hover,
        .button-row button:hover {
          background: #ddd;
        }

        .button-row {
          margin-top: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .post-image {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
        }

        .comments-section {
          margin-top: 1rem;
          border-top: 1px solid #eee;
          padding-top: 0.5rem;
        }

        .comments-section ul {
          list-style: none;
          padding-left: 0;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 0.5rem;
        }

        .comments-section li {
          padding: 0.25rem 0;
          border-bottom: 1px solid #eee;
        }

        .comments-section textarea {
          width: 100%;
          resize: vertical;
          margin-bottom: 0.3rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .comments-section button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: 0.2s;
        }

        .comments-section button:hover {
          background: #005bb5;
        }
      `}</style>
    </>
  );
}
