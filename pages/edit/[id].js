import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Image from "next/image";

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: null,
  });

  const [type, setType] = useState(null); // "writing" | "artwork" | "both"
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [isClient, setIsClient] = useState(false); // 🆕

  const inferType = (imageUrl, contentText) => {
    const hasImage = Boolean(imageUrl);
    const hasContent = contentText != null && contentText.trim() !== "";
    if (hasImage && hasContent) return "both";
    if (hasImage) return "artwork";
    return "writing";
  };

  // 🆕 Ensure hydration-safe rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !id) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setForm({
          title: data.title ?? "",
          content: data.content ?? "",
          image: null,
        });

        setOriginalImage(data.image ?? null);
        setImagePreview(data.image ?? null);

        const inferred = inferType(data.image, data.content);
        setType(inferred);
      })
      .catch((err) => {
        console.error("Failed to fetch post", err);
        setError("Failed to load post.");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });

      if (file && typeof window !== "undefined") {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🧼 Clean up blob preview URLs
  useEffect(() => {
    return () => {
      if (imagePreview && form.image instanceof File) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, form.image]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if ((type === "artwork" || type === "both") && !form.image && !originalImage) {
      setError("An image is required for this post type.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    if (form.content?.trim()) {
      formData.append("content", form.content);
    }
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      setError("");
      setUploading(true);
      setUploadProgress(0);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/`,
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
      router.push("/");
    } catch (err) {
      console.error("Update failed:", err);
      setUploading(false);
      setError("Failed to update post.");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (type === null) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading post...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
          Edit Post
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter a title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Content */}
          {(type === "writing" || type === "both") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                name="content"
                placeholder="Edit your content..."
                value={form.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg shadow-sm resize-y focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {/* Image Upload */}
          {(type === "artwork" || type === "both") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload new image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-gray-700 dark:text-gray-200 
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-600
                  hover:file:bg-blue-100
                  dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600
                "
              />

              {/* Image Preview */}
              {isClient && imagePreview && (
                <div className="mt-4 w-full max-h-64 rounded-lg border dark:border-gray-700 shadow-md overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-900">
                  {form.image instanceof File ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-contain max-h-64 w-auto"
                      style={{ maxHeight: "16rem" }}
                    />
                  ) : (
                    <Image
                      src={imagePreview}
                      alt="Existing Image"
                      width={600}
                      height={400}
                      className="object-contain max-h-64 w-auto"
                      unoptimized={true}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="flex items-center gap-4">
              <progress
                value={uploadProgress}
                max="100"
                className="w-full h-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {uploadProgress}%
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? "Updating..." : "Update Post"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
