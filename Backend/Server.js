const express = require("express");
const Profile = require("./models/Profile");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});