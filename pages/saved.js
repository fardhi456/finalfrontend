import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Link from "next/link";

export default function SavedPosts() {
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved post IDs from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_posts") || "[]");
    // Optional: filter only numbers or strings to be safe
    const filteredSaved = saved.filter(
      (id) => typeof id === "number" || typeof id === "string"
    );
    setSavedPostIds(filteredSaved);
  }, []);

  // Fetch all posts once, then filter saved ones
  useEffect(() => {
    if (savedPostIds.length === 0) {
      setSavedPosts([]);
      setLoading(false);
      return;
    }

    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`);
        const allPosts = res.data;

        // Filter only posts that are saved
        const filteredPosts = allPosts.filter((post) =>
          savedPostIds.includes(post.id)
        );

        setSavedPosts(filteredPosts);
      } catch (error) {
        console.error("Failed to fetch saved posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [savedPostIds]);

  const removeFromSaved = (postId) => {
    const updated = savedPostIds.filter((id) => id !== postId);
    setSavedPostIds(updated);
    localStorage.setItem("saved_posts", JSON.stringify(updated));
    setSavedPosts(savedPosts.filter((post) => post.id !== postId));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container">
          <h1>Saved Posts</h1>
          <p>Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Saved Posts</h1>
        {savedPosts.length === 0 ? (
          <p>You have no saved posts.</p>
        ) : (
          savedPosts.map((post) => (
            <article key={post.id} className="post-card">
              <h2>{post.title}</h2>
              {post.image && (
                <img src={post.image} alt="Post" className="post-image" />
              )}
              <p>{post.content}</p>
              <p>
                <em>By: {post.author.username}</em>
              </p>
              <div className="button-row">
                <button onClick={() => removeFromSaved(post.id)}>
                  Remove from Saved
                </button>
              </div>
            </article>
          ))
        )}
      </main>
    </>
  );
}
