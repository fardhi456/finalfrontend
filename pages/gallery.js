"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { Search } from "lucide-react"; // ✅ for search icon

export default function Gallery() {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Activities", "Facilities", "CollagePhotography"];

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await fetch("/galleryData.json"); // from public folder
        const data = await res.json();
        setPhotos(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to load gallery", err);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  // 🧠 Filter by category + search
  useEffect(() => {
    let result = photos;

    if (activeCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [query, activeCategory, photos]);

  const handleImageClick = (url) => setSelectedImage(url);
  const handleRemoveImage = () => setSelectedImage(null);

  return (
    <>
      <Navbar />

      {/* Full Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="relative max-w-4xl w-full px-4">
            <Image
              src={selectedImage}
              alt="Full view"
              width={1920}
              height={1080}
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

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 px-6 py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-indigo-600 dark:text-indigo-400 tracking-tight">
            ✨ College Art & Photography
          </h1>

          {/* 🔍 Search + Category Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artworks..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <p className="text-center text-lg animate-pulse">Loading gallery...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500">
              No artworks found for &quot;{query}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="relative cursor-pointer group overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                  onClick={() => handleImageClick(p.image)}
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={400}
                    height={300}
                    className="w-full h-60 object-cover rounded-xl transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-end p-4">
                    <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                    <p className="text-sm text-gray-200">{p.category}</p>
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
