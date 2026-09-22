const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    linkedin: String,
    github: String,
    gender: String,
    experience: String,
    noticePeriod: String,
    jobTitle: String,
    company: String,
    workLocation: String,
    startDate: String,
    endDate: String,
    school: String,
    degree: String,
    fieldOfStudy: String,
    gpa: String,
    educationFrom: String,
    educationTo: String,
    skills: String,
    relocate: Boolean,
    terms: Boolean
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);
