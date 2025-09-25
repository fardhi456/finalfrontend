// pages/create-post.js
import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("art");
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch photos from Pexels API
  const fetchPhotos = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setPhotos([]);
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://api.pexels.com/v1/search", {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY,
        },
        params: {
          query: trimmedQuery,
          per_page: 20,
          orientation: "landscape",
        },
      });
      setPhotos(res.data.photos);
    } catch (err) {
      console.error("Error fetching photos from Pexels", err);
      setError("Failed to fetch photos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image click to display in full view
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Remove the selected image (close the full view)
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <Navbar />

      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="relative max-w-4xl w-full px-4">
            <img
              src={selectedImage}
              alt="Full view"
              className="rounded-lg shadow-lg w-full object-contain max-h-[80vh]"
            />
            <button
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition"
              onClick={handleRemoveImage}
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-indigo-600 dark:text-indigo-400">
            🖼️ Gallery
          </h1>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for photos, artworks, etc."
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchPhotos();
              }}
              className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={fetchPhotos}
              disabled={!query.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              🔍 Search
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center font-medium mb-6">{error}</p>
          )}

          {/* Loading State */}
          {loading ? (
            <p className="text-center text-lg animate-pulse">Loading photos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition"
                  onClick={() => handleImageClick(photo.src.original)}
                >
                  <img
                    src={photo.src.medium}
                    alt={photo.photographer}
                    loading="lazy"
                    className="w-full h-60 object-cover rounded-lg transform group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-lg transition">
                    View Full
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
