import { useState } from "react";
import axios from "axios";

export default function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const response = await axios.post("http://localhost:5000/generate", {
        prompt,
      });

      console.log("Backend Response:", response.data); // Debugging

      if (response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
      } else {
        setError("No image received. Check backend.");
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      setError("Failed to generate image. Check console.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-7xl font-bold mb-4">Text to Image Generator</h1>
      <p className="font-semibold text-lg mb-4"> Generate your imagination</p>
      <div className="relative">
        <input
          className="w-3xl max-w-4xl px-4 py-2 rounded-full  border border-gray-300 outline-none shadow-md rounded-full "
          type="text"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={generateImage}
          disabled={loading}
          className="bg-blue-500 absolute top-0 right-0  text-white px-4 py-2 rounded-full shadow-md disabled:bg-blue-300"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {imageUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Generated Image:</h2>
          <img
            src={imageUrl}
            alt="Generated"
            className="mt-3 border border-gray-300 shadow-md rounded-lg shadow-md max-w-lg"
          />
        </div>
      )}
    </div>
  );
}
