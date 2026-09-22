const express = require("express");
const Profile = require("./models/Profile");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error));
} else {
  console.warn("MONGO_URI is not configured. Resume parsing is available; profile database routes are disabled.");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function firstMatch(text, expression) {
  const match = text.match(expression);
  return match ? match[1].trim() : "";
}

function parseResumeText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const email = firstMatch(text, /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i);
  const phone = firstMatch(text, /(?:\+?\d{1,3}[\s.-]?)?(\d[\d\s().-]{8,}\d)/);
  const linkedin = firstMatch(text, /(https?:\/\/(?:www\.)?linkedin\.com\/[^\s,]+)/i);
  const github = firstMatch(text, /(https?:\/\/(?:www\.)?github\.com\/[^\s,]+)/i);
  const nameLine = lines.find((line) => /^[A-Za-z]+(?:[ .'-][A-Za-z]+){1,3}$/.test(line) && !/resume|curriculum|developer|engineer/i.test(line)) || "";
  const [firstName = "", ...lastNameParts] = nameLine.split(/\s+/);
  const supportedSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB",
    "SQL", "MySQL", "Python", "Java", "C++", "HTML", "CSS", "Git",
    "GitHub", "REST API", "Docker", "AWS", "Azure", "Figma",
  ];
  const skills = supportedSkills.filter((skill) => {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapedSkill.replace(".", "\\.")}\\b`, "i").test(text);
  });
  const education = lines.filter((line) =>
    /\b(B\.?\s?(?:Tech|E|Sc|CA)|M\.?\s?(?:Tech|Sc|BA|CA)|Bachelor|Master|Diploma|University|College)\b/i.test(line),
  ).slice(0, 5);
  const yearMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/gi)]
    .map((match) => Number(match[1]));
  const yearsOfExperience = yearMatches.length ? Math.max(...yearMatches) : null;
  const experienceSummary = lines.filter((line) =>
    /\b(experience|intern|developer|engineer|analyst|manager|associate)\b/i.test(line),
  ).slice(0, 6);

  return {
    firstName,
    lastName: lastNameParts.join(" "),
    email,
    phone: phone.replace(/[^\d+]/g, ""),
    linkedin,
    github,
    experience: yearsOfExperience === null ? "" : String(Math.floor(yearsOfExperience)),
    skills,
    education,
    experienceSummary,
    rawText: text,
  };
}

async function extractResumeText(file) {
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.originalname.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  throw new Error("Only PDF and DOCX resumes are supported.");
}

app.get("/", (req, res) => {
  res.json({
    message: "Project Flow Backend Running"
  });
});


app.post("/api/profile", async (req, res) => {
  try {
    const profile = await Profile.create(req.body);

    res.status(201).json({
      message: "Profile saved successfully",
      profile
    });
  } catch (error) {
    console.error("Profile save error:", error);

    res.status(500).json({
      message: "Failed to save profile"
    });
  }
});

app.get("/api/profile", async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ createdAt: -1 });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.json(profile);

  } catch (error) {
    console.error("Profile fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch profile"
    });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/api/resume/parse", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please choose a PDF or DOCX resume." });
  }

  try {
    const text = await extractResumeText(req.file);
    if (!text.trim()) {
      return res.status(422).json({ message: "No readable text was found in this resume." });
    }
    res.json({ profile: parseResumeText(text) });
  } catch (error) {
    console.error("Resume parsing error:", error);
    res.status(400).json({ message: error.message || "Unable to parse this resume." });
  }
});
