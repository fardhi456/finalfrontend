import { useState, useEffect } from "react";
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
    setSelectedImage(imageUrl); // Set the clicked image to be displayed in full view
  };

  // Remove the selected image (close the full view)
  const handleRemoveImage = () => {
    setSelectedImage(null); // Reset selected image to null
  };

  return (
    <>
      <Navbar />

      {/* Full Image Display Box */}
      {selectedImage && (
        <div className="full-image-box">
          <div className="full-image-wrapper">
            <img src={selectedImage} alt="Full view" className="full-image" />
            <button className="remove-image-btn" onClick={handleRemoveImage}>
              X
            </button>
          </div>
        </div>
      )}

      <div className="gallery-container">
        <h1>Gallery</h1>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for photos, artworks, etc."
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchPhotos();
            }}
          />
          <button onClick={fetchPhotos} disabled={!query.trim()}>
            Search
          </button>
        </div>

        {/* Display Error */}
        {error && <p className="error">{error}</p>}

        {/* Loading state */}
        {loading ? (
          <p>Loading photos...</p>
        ) : (
          <div className="image-grid">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="image-card"
                onClick={() => handleImageClick(photo.src.original)} // Set full image on click
              >
                <img
                  src={photo.src.medium}
                  alt={photo.photographer}
                  loading="lazy"
                  className="image-card-img"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .gallery-container {
          padding: 20px;
        }

        .search-bar {
          margin: 20px 0;
          text-align: center;
          width: 100%;
        }

        input {
          padding: 8px;
          width: 240px;
          max-width: 80%;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 10px;
        }

        button {
          padding: 8px 16px;
          border: none;
          background-color: #0070f3;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background-color: #999;
          cursor: not-allowed;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .image-card {
          position: relative;
          cursor: pointer;
        }

        .image-card-img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .image-card-img:hover {
          transform: scale(1.03);
        }

        /* Full Image Display */
        .full-image-box {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .full-image-wrapper {
          position: relative;
          max-width: 70%; /* Adjusted for a smaller box */
          max-height: 70%; /* Adjusted for a smaller box */
          overflow: hidden;
          border-radius: 8px;
        }

        .full-image {
          width: 100%;
          height: auto;
          object-fit: contain; /* Ensure the image fits neatly within the box */
        }

        .remove-image-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 8px 16px;
          background-color: #ff4747;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .remove-image-btn:hover {
          opacity: 0.8;
        }

        .error {
          color: red;
          margin-top: 10px;
        }
      `}</style>
    </>
  );
}
