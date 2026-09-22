const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "linkedin",
    "github",
    "gender",
    "experience",
    "noticePeriod",
    "jobTitle",
    "company",
    "workLocation",
    "startDate",
    "endDate",
    "school",
    "degree",
    "fieldOfStudy",
    "gpa",
    "educationFrom",
    "educationTo",
    "skills",
    "relocate",
    "terms"
];

const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");
const resumeInput = document.getElementById("resume");
const parseResumeBtn = document.getElementById("parseResumeBtn");
const resumeMessage = document.getElementById("resumeMessage");
const fillPageBtn = document.getElementById("fillPageBtn");
const fillMessage = document.getElementById("fillMessage");
const nextStepBtn = document.getElementById("nextStepBtn");
const navigationMessage = document.getElementById("navigationMessage");
const resumeReview = document.getElementById("resumeReview");
const skillsReview = document.getElementById("skillsReview");
const educationReview = document.getElementById("educationReview");
const experienceReview = document.getElementById("experienceReview");
let parsedResumeDetails = null;


// ======================================
// LOAD SAVED PROFILE
// ======================================

chrome.storage.local.get(fields, (data) => {

    console.log("Loaded profile:", data);

    fields.forEach((field) => {

        const element = document.getElementById(field);

        if (!element) {
            console.log("Element not found:", field);
            return;
        }

        // Checkbox
        if (element.type === "checkbox") {

            element.checked = data[field] === true;

        } else {

            element.value = data[field] || "";
        }
    });

});


// ======================================
// SAVE PROFILE
// ======================================

saveBtn.addEventListener("click", () => {

    const profile = {};

    fields.forEach((field) => {

        const element = document.getElementById(field);

        if (!element) {
            console.log("Element not found:", field);
            return;
        }

        // Checkbox
        if (element.type === "checkbox") {

            profile[field] = element.checked;

        } else {

            profile[field] = element.value.trim();
        }

    });


    console.log("Profile before saving:", profile);


    chrome.storage.local.set({ ...profile, resumeDetails: parsedResumeDetails }, () => {

        if (chrome.runtime.lastError) {

            console.error(
                "Storage error:",
                chrome.runtime.lastError
            );

            message.textContent =
                "Error saving profile";

            return;
        }


        console.log(
            "Profile saved successfully:",
            profile
        );

        message.textContent =
            "Profile saved successfully!";
    });

});

parseResumeBtn.addEventListener("click", async () => {
    const resume = resumeInput.files[0];

    if (!resume) {
        resumeMessage.textContent = "Please choose a PDF or DOCX resume.";
        return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    parseResumeBtn.disabled = true;
    resumeMessage.textContent = "Extracting resume details...";

    try {
        const response = await fetch("http://localhost:8000/api/resume/parse", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to parse the resume.");
        }

        fields.forEach((field) => {
            const element = document.getElementById(field);
            const value = data.profile[field];

            if (!element || value === undefined || value === "") {
                return;
            }

            element.value = value;
        });

        parsedResumeDetails = {
            skills: data.profile.skills || [],
            education: data.profile.education || [],
            experienceSummary: data.profile.experienceSummary || [],
        };
        skillsReview.textContent = `Skills: ${parsedResumeDetails.skills.join(", ") || "Not detected"}`;
        educationReview.textContent = `Education: ${parsedResumeDetails.education.join(" | ") || "Not detected"}`;
        experienceReview.textContent = `Experience: ${parsedResumeDetails.experienceSummary.join(" | ") || "Not detected"}`;
        resumeReview.hidden = false;
        resumeMessage.textContent = "Details extracted. Review them, then click Save Profile.";
    } catch (error) {
        console.error("Resume parsing error:", error);
        resumeMessage.textContent = error.message;
    } finally {
        parseResumeBtn.disabled = false;
    }
});

nextStepBtn.addEventListener("click", () => {
    navigationMessage.textContent = "Looking for the next-step button...";
    nextStepBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.id) {
            navigationMessage.textContent = "No active application tab was found.";
            nextStepBtn.disabled = false;
            return;
        }

        chrome.tabs.sendMessage(tab.id, { type: "PROJECT_FLOW_NEXT_STEP" }, (result) => {
            nextStepBtn.disabled = false;

            if (chrome.runtime.lastError) {
                navigationMessage.textContent = "Open a supported Workday page, refresh it, then try again.";
                return;
            }

            navigationMessage.textContent = result?.message || "Unable to continue to the next step.";
        });
    });
});

fillPageBtn.addEventListener("click", () => {
    fillMessage.textContent = "Filling detected fields on this page...";
    fillPageBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab?.id) {
            fillMessage.textContent = "No active application tab was found.";
            fillPageBtn.disabled = false;
            return;
        }

        chrome.tabs.sendMessage(tab.id, { type: "PROJECT_FLOW_FILL_PAGE" }, (result) => {
            fillPageBtn.disabled = false;

            if (chrome.runtime.lastError) {
                fillMessage.textContent = "Open a supported Workday page, refresh it once, then try again.";
                return;
            }

            fillMessage.textContent = result?.message || "Fill request completed. Please review the form.";
        });
    });
});
