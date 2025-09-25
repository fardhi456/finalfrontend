// pages/about.js
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-indigo-600 dark:text-indigo-400">
            ✨ About Us – Campus Creatives
          </h1>

          {/* Who We Are */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-indigo-500 pb-2 inline-block">
              Who We Are
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              <strong>Campus Creatives</strong> is a digital magazine built by students, for students. It’s a space
              where creativity finds a voice — whether through writing, art, design, or photography.
            </p>
          </section>

          {/* Our Mission */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-indigo-500 pb-2 inline-block">
              Our Mission
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              We aim to empower students to share their creativity with the world, build confidence, and connect
              with like-minded peers. Every student has unique stories, ideas, and talents, and Campus Creatives
              is here to showcase them.
            </p>
          </section>

          {/* What We Offer */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-indigo-500 pb-2 inline-block">
              What We Offer
            </h2>
            <ul className="list-disc list-inside space-y-3 text-lg text-gray-700 dark:text-gray-300">
              <li>🖊️ A platform to publish writings, essays, or blogs</li>
              <li>🎨 A gallery to share artworks and designs</li>
              <li>📸 A showcase for photography and creative media</li>
              <li>❤️ Interaction through likes, comments, and saves</li>
              <li>🌍 A safe, inclusive community where all students feel welcome</li>
            </ul>
          </section>

          {/* Our Vision */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-indigo-500 pb-2 inline-block">
              Our Vision
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              We envision Campus Creatives as more than just a magazine — it’s a student-driven creative hub
              that inspires collaboration, expression, and recognition across campuses.
            </p>
          </section>

          {/* Why Campus Creatives */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-indigo-500 pb-2 inline-block">
              Why Campus Creatives?
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Because every student deserves a stage. Whether you’re a writer, an artist, or someone who simply
              enjoys creativity, Campus Creatives provides a supportive space to grow and shine.
            </p>
          </section>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <p className="text-xl font-semibold mb-4">
              🚀 Ready to share your creativity with the world?
            </p>
            <a
              href="/register"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Join Campus Creatives Today
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
