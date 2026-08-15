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
    "relocate",
    "terms"
];

const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");


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


    chrome.storage.local.set(profile, () => {

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