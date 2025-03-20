import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";

dotenv.config();
const app = express();

// Fix __dirname issue for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the 'public' directory exists
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Serve static files
app.use("/public", express.static(publicDir));

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 5) {
      return res.status(400).json({ error: "Prompt is too short or missing!" });
    }

    // Create form-data for Stability AI API
    let formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("width", "512");
    formData.append("height", "512");
    formData.append("steps", "20");
    formData.append("cfg_scale", "7");

    // Send request to Stability AI API
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data.image) {
      const imageBuffer = Buffer.from(response.data.image, "base64");
      const imagePath = path.join(publicDir, "generated_image.png");
      fs.writeFileSync(imagePath, imageBuffer);

      res.json({
        imageUrl: `http://localhost:5000/public/generated_image.png`,
      });
    } else {
      res.status(500).json({ error: "No image returned from Stability AI" });
    }
  } catch (error) {
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
