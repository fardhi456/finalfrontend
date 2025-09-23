import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";

export default function CreatePost() {
  const [form, setForm] = useState({ title: "", content: "", image: null });
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

      // Generate preview URL for image
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Clean up object URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!form.title || !form.content) {
      setError("Title and content are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      setError("");
      setUploading(true);
      setUploadProgress(0);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploading(false);
      setUploadProgress(0);
      router.push("/");
    } catch (err) {
      console.error(err);
      setUploading(false);
      setError("Failed to create post.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Create New Post</h1>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="content"
            placeholder="Write your content here..."
            value={form.content}
            onChange={handleChange}
            required
          />
          <input type="file" name="image" accept="image/*" onChange={handleChange} />

          {/* Image Preview */}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected Preview" />
            </div>
          )}

          {/* Upload Progress Indicator */}
          {uploading && (
            <div className="upload-progress">
              <progress value={uploadProgress} max="100" />
              <span>{uploadProgress}%</span>
            </div>
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Post"}
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <style jsx>{`
        .image-preview {
          margin: 10px 0;
        }
        .image-preview img {
          max-width: 300px;
          max-height: 200px;
          object-fit: contain;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .upload-progress {
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        progress {
          width: 100%;
          height: 20px;
        }
        .error {
          color: red;
          margin-top: 10px;
        }
        button[disabled] {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
