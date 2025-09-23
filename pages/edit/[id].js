import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !id) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setPost(res.data);
        setTitle(res.data.title);
        setContent(res.data.content);
      })
      .catch((err) => {
        console.error("Failed to fetch post", err);
        setError("Failed to load post");
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      router.push("/");
    } catch (err) {
      console.error("Update failed", err);
      setError("Update failed");
    }
  };

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="container"><p>Loading post...</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Edit Post</h1>
        {error && <p className="error">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            required
            rows={6}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">Update Post</button>
        </form>
      </div>
    </>
  );
}
