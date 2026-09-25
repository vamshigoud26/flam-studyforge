import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import mammoth from "mammoth";
import { createRequire } from "node:module";
import { generateQuiz } from "./generate.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StudyForge API is running"
  });
});

app.post("/api/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded."
      });
    }

    const extension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    let text = "";

    if (["txt", "md", "csv"].includes(extension)) {
      text = req.file.buffer.toString("utf8");
    } else if (extension === "pdf") {
      const result = await pdfParse(req.file.buffer);
      text = result.text;
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({
        buffer: req.file.buffer
      });
      text = result.value;
    } else {
      return res.status(400).json({
        success: false,
        error: "Supported files: PDF, TXT, DOCX, MD, and CSV."
      });
    }

    text = text.trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "The uploaded file contains no readable text."
      });
    }

    return res.json({
      success: true,
      text: text.slice(0, 5000)
    });
  } catch (error) {
    console.error("File extraction error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not read the uploaded file."
    });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      return res.status(400).json({
        success: false,
        error: "Study topic or notes are required."
      });
    }

    const cleanedInput = input.trim();

    if (cleanedInput.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Please enter at least 3 characters."
      });
    }

    if (cleanedInput.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "Input must be under 5000 characters."
      });
    }

    const quiz = await generateQuiz(cleanedInput);

    return res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error("Generation error:", error);

    const busy =
      error?.status === 429 ||
      error?.status === 503 ||
      String(error?.message || "").toLowerCase().includes("high demand");

    return res.status(500).json({
      success: false,
      error: busy
        ? "The quiz model is busy right now. Please try again in a moment."
        : "Failed to generate quiz. Please try again."
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: "File is too large. Maximum size is 10 MB."
    });
  }

  return next(error);
});

app.listen(PORT, () => {
  console.log(`StudyForge server running on http://localhost:${PORT}`);
});