import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <div className="about-content">
          <h1 className="about-title">✨ About Us – Campus Creatives</h1>

          <section className="about-section">
            <h2>Who We Are</h2>
            <p>
              <strong>Campus Creatives</strong> is a digital magazine built by students, for students. It’s a space where
              creativity finds a voice — whether through writing, art, design, or photography.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              We aim to empower students to share their creativity with the world, build confidence, and connect with
              like-minded peers. Every student has unique stories, ideas, and talents, and Campus Creatives is here to
              showcase them.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Offer</h2>
            <ul className="about-list">
              <li>🖊️ A platform to publish writings, essays, or blogs</li>
              <li>🎨 A gallery to share artworks and designs</li>
              <li>📸 A showcase for photography and creative media</li>
              <li>❤️ Interaction through likes, comments, and saves</li>
              <li>🌍 A safe, inclusive community where all students feel welcome</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Vision</h2>
            <p>
              We envision Campus Creatives as more than just a magazine — it’s a student-driven creative hub that inspires
              collaboration, expression, and recognition across campuses.
            </p>
          </section>

          <section className="about-section">
            <h2>Why Campus Creatives?</h2>
            <p>
              Because every student deserves a stage. Whether you’re a writer, an artist, or someone who simply enjoys
              creativity, Campus Creatives provides a supportive space to grow and shine.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
