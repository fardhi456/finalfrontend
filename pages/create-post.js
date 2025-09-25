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
    if (!form.image && queryImage) {
      try {
        const decoded = decodeURIComponent(queryImage);
        setDecodedImage(decoded);
        setImagePreview(decoded);
        setForm((prev) => ({ ...prev, image: decoded }));
      } catch {}
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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
          Create New Post
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter post title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Content */}
          {(type === "writing" || type === "both") && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                Content
              </label>
              <textarea
                name="content"
                placeholder="Write your content here..."
                value={form.content}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          )}

          {/* Image */}
          {(type === "artwork" || type === "both") && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-gray-700 dark:text-gray-300"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Selected Preview"
                    className="w-full max-h-72 object-contain rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 flex items-center gap-3">
              <progress
                value={uploadProgress}
                max="100"
                className="w-full h-3 rounded-lg overflow-hidden"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {uploadProgress}%
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-600 dark:text-red-400 font-medium mt-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Post"}
          </button>
        </form>
      </div>
    </>
  );
}
