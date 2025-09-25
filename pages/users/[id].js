import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserAndPosts = useCallback(async () => {
    try {
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/public/${id}/`
      );
      setUser(userRes.data);

      const postsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/?author=${id}`
      );
      setPosts(postsRes.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("User not found or failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchUserAndPosts();
  }, [id, fetchUserAndPosts]);

  const getProfilePicUrl = (avatar) => {
    if (!avatar) return "/default-avatar.png";
    return avatar.startsWith("http")
      ? avatar
      : `${process.env.NEXT_PUBLIC_API_URL}${avatar}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading user profile...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-red-600 dark:text-red-400 text-lg font-medium">
            {error}
          </p>
        </div>
      </>
    );
  }

  const profilePic = getProfilePicUrl(user?.avatar || user?.profile_pic);

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center">
          <img
            src={profilePic}
            alt={`${user.username}'s profile`}
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover mb-4 shadow-lg border-2 border-gray-300 dark:border-gray-600"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {user?.username}&apos;s Public Profile
          </h1>
          {user?.bio && (
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">
              {user.bio}
            </p>
          )}
        </div>

        {/* Posts Section */}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-6">
          Posts by {user?.username}
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            This user hasn’t posted anything yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col hover:shadow-xl transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {post.title}
                </h3>
                {post.image && (
                  <img
                    src={post.image.startsWith("http") ? post.image : `${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
                    alt="Post"
                    className="w-full h-48 sm:h-56 object-cover rounded-lg mb-3"
                  />
                )}
                <p className="text-gray-700 dark:text-gray-300 mb-2 flex-1">
                  {post.content}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Likes: {post.likes_count}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
