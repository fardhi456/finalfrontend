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
    if (id) {
      fetchUserAndPosts();
    }
  }, [id, fetchUserAndPosts]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Loading user profile...</p>
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
        <h1>{user?.username}&apos;s Public Profile</h1>

        {user?.profile_pic && (
          <img
            src={user.profile_pic}
            alt={`${user.username}'s profile`}
            className="profile-pic"
          />
        )}

        {user?.bio && (
          <p>
            <strong>Bio:</strong> {user.bio}
          </p>
        )}

        <h2>Posts by {user?.username}</h2>
        {posts.length === 0 ? (
          <p>This user hasn’t posted anything yet.</p>
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
        .container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 1rem;
        }

        .profile-pic {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        .post-card {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .post-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          margin-top: 0.5rem;
        }

        .error {
          color: red;
        }

        h1,
        h2 {
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}
