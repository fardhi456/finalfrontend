import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";

export default function CreatePost() {
  const router = useRouter();
  const { type, image: queryImage } = router.query;

  const [form, setForm] = useState({ title: "", content: "", image: null });
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [decodedImage, setDecodedImage] = useState(null); // New state to hold the decoded image URL

  useEffect(() => {
    // If no local image file selected yet but query param image exists,
    // use that as preview image
    if (!form.image && queryImage) {
      try {
        const decoded = decodeURIComponent(queryImage);
        setDecodedImage(decoded); // Set the decoded URL in state
        setImagePreview(decoded); // Set the preview
        setForm((prev) => ({
          ...prev,
          image: decoded, // Use decoded image URL as a mock image (for validation)
        }));
      } catch {
        // ignore decoding errors
      }
    }
  }, [queryImage, form.image]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

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

  useEffect(() => {
    return () => {
      if (imagePreview && form.image) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, form.image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if ((type === "writing" || type === "both") && !form.content.trim()) {
      setError("Content is required for this post type.");
      return;
    }

    if ((type === "artwork" || type === "both") && !form.image) {
      setError("An image is required for this post type.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    
    // Only append image if it's a file, not a URL
    if (form.image && form.image !== decodedImage) {
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
          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          {/* Content */}
          {(type === "writing" || type === "both") && (
            <textarea
              name="content"
              placeholder="Write your content here..."
              value={form.content}
              onChange={handleChange}
              required
            />
          )}

          {/* Image */}
          {(type === "artwork" || type === "both") && (
            <>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Selected Preview" />
                </div>
              )}
            </>
          )}

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
