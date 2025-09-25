import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function SavedPosts() {
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved post IDs from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved_posts") || "[]");
    const filteredSaved = saved.filter(
      (id) => typeof id === "number" || typeof id === "string"
    );
    setSavedPostIds(filteredSaved);
  }, []);

  // Fetch saved posts
  useEffect(() => {
    if (savedPostIds.length === 0) {
      setSavedPosts([]);
      setLoading(false);
      return;
    }

    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/`
        );
        const allPosts = res.data;

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
        <main className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Saved Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Saved Posts
        </h1>

        {savedPosts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            You have no saved posts.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 flex flex-col hover:shadow-lg transition duration-300"
              >
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {post.title}
                </h2>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="rounded-lg mb-4 w-full h-48 object-cover"
                  />
                )}

                <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                  {post.content}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <em>By: {post.author.username}</em>
                </p>

                <div className="mt-auto flex justify-end">
                  <button
                    onClick={() => removeFromSaved(post.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg shadow transition duration-300"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
