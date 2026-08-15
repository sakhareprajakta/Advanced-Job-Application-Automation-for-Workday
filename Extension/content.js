function getProfile() {
  return new Promise((resolve) => {
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

      // New fields
      "gender",
      "experience",
      "noticePeriod",
      "relocate",
      "terms",
    ];

    chrome.storage.local.get(fields, (data) => {
      console.log("Project Flow Profile:", data);

      resolve(data);
    });
  });
}

function fillInput(input, value) {
  if (!input || !value) return;

  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  const textareaSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;

  if (input.tagName === "TEXTAREA" && textareaSetter) {
    textareaSetter.call(input, value);
  } else if (nativeSetter) {
    nativeSetter.call(input, value);
  } else {
    input.value = value;
  }

  // React / Angular / normal website events
  input.dispatchEvent(
    new Event("input", {
      bubbles: true,
    }),
  );

  input.dispatchEvent(
    new Event("change", {
      bubbles: true,
    }),
  );

  input.dispatchEvent(
    new Event("blur", {
      bubbles: true,
    }),
  );
}



const fieldAliases = {

    firstName: [
        "firstname",
        "first_name",
        "fname",
        "givenname",
        "given_name",
        "candidatefirstname",
        "candidate_first_name",
        "applicantfirstname",
        "applicant_first_name"
    ],

    lastName: [
        "lastname",
        "last_name",
        "lname",
        "surname",
        "familyname",
        "family_name",
        "candidate_last_name",
        "applicant_last_name"
    ],

    email: [
        "email",
        "emailaddress",
        "email_address",
        "mail",
        "candidateemail",
        "candidate_email",
        "applicantemail"
    ],

    phone: [
        "phone",
        "phonenumber",
        "phone_number",
        "mobile",
        "mobilenumber",
        "mobile_number",
        "contact",
        "contactnumber",
        "contact_number",
        "telephone",
        "tel"
    ],

    address: [
        "address",
        "street",
        "streetaddress",
        "street_address",
        "residentialaddress",
        "residential_address",
        "homeaddress",
        "home_address"
    ],

    city: [
        "city",
        "town",
        "district"
    ],

    state: [
        "state",
        "province",
        "region"
    ],

    pincode: [
        "pincode",
        "pin",
       
        "pincode_number",
        "postalcode",
        "postal_code",
        "zipcode",
        "zip_code",
        "zip"
    ],

    linkedin: [
        "linkedin",
        "linkedinurl",
        "linkedin_url",
        "linkedinprofile",
        "linkedin_profile"
    ],

    github: [
        "github",
        "githuburl",
        "github_url",
        "githubprofile",
        "github_profile"
    ],

    gender: [
        "gender",
        "sex"
    ],

    experience: [
        "experience",
        "workexperience",
        "work_experience",
        "yearsofexperience",
        "years_of_experience",
        "totalexperience",
        "total_experience"
    ],

    noticePeriod: [
        "noticeperiod",
        "notice_period",
        "notice",
        "noticeperioddays"
    ],

    relocate: [
        "relocate",
        "relocation",
        "willingtorelocate",
        "willing_to_relocate"
    ],

    terms: [
        "terms",
        "agreement",
        "agree",
        "termsandconditions",
        "terms_and_conditions"
    ]
};

function normalizeFieldText(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "")
        .trim();
}


function matchFieldAlias(text) {

    const normalizedText = normalizeFieldText(text);

    for (const field in fieldAliases) {

        const aliases = fieldAliases[field];

        for (const alias of aliases) {

            const normalizedAlias =
                normalizeFieldText(alias);

            if (
                normalizedText === normalizedAlias ||
                normalizedText.includes(normalizedAlias)
            ) {
                return field;
            }
        }
    }

    return null;
}




function detectNearbyLabel(input) {
  if (!input) return "";

  let current = input.parentElement;

  for (let i = 0; i < 3 && current; i++) {

    // Look for label
    const label = current.querySelector("label");

    if (label) {
      return label.innerText.trim();
    }

    // Look for common label elements
    const labelElement = current.querySelector(
      ".field-label, .form-label, .label"
    );

    if (labelElement) {
      return labelElement.innerText.trim();
    }

    current = current.parentElement;
  }

  return "";
}



function detectField(input) {
  const name = (input.name || "").toLowerCase();
  const id = (input.id || "").toLowerCase();
  const value = (input.value || "").toLowerCase();
  const placeholder = input.placeholder || "";
  const ariaLabel = input.getAttribute("aria-label") || "";
  const autocomplete = input.getAttribute("autocomplete") || "";

 

  // =================================
  // RADIO: RELOCATE
  // =================================

  if (
    input.type === "radio" &&
    (name.includes("relocate") || id.includes("relocate"))
  ) {
    return "relocate";
  }

  // =================================
  // CHECKBOX: TERMS
  // =================================

  if (
    input.type === "checkbox" &&
    (name.includes("term") || id.includes("term"))
  ) {
    return "terms";
  }

  // const name = input.name || "";
  // const id = input.id || "";
  

  // Find associated label
  let labelText = "";

  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);

    if (label) {
      labelText = label.innerText || "";
    }
  }

  // Also check parent label
  const parentLabel = input.closest("label");

  if (parentLabel) {
    labelText += " " + (parentLabel.innerText || "");
  }

 const text = `
        ${name}
        ${id}
        ${placeholder}
        ${ariaLabel}
        ${autocomplete}
        ${labelText}
      
      
    `
    .toLowerCase()
    .trim();

  console.log("Checking field:", input, "→", text);

  console.log("FIELD DATA:", {
  name,
  id,
  type: input.type,
  placeholder,
  ariaLabel,
  autocomplete,
  labelText
});







// =================================
// NEARBY SEMANTIC LABEL
// =================================

const nearbyLabel = detectNearbyLabel(input);

if (nearbyLabel) {

  const nearbyField = matchFieldAlias(nearbyLabel);

  if (nearbyField) {

    console.log(
      "Nearby Label Match:",
      nearbyLabel,
      "→",
      nearbyField
    );

    return nearbyField;
  }
}

  // =================================
// PHASE 2: UNIVERSAL ALIAS MATCHING
// =================================

const aliasResult = matchFieldAlias(text);

if (aliasResult) {
  console.log(
    "Universal Alias Match:",
    text,
    "→",
    aliasResult
  );

  return aliasResult;
}

  // =========================
  // FIRST NAME
  // =========================

  if (
    text.includes("first name") ||
    text.includes("firstname") ||
    text.includes("first_name") ||
    text.includes("fname") ||
    text.includes("given-name") ||
    autocomplete === "given-name"
  ) {
    return "firstName";
  }

  // =========================
  // LAST NAME
  // =========================

  if (
    text.includes("last name") ||
    text.includes("lastname") ||
    text.includes("last_name") ||
    text.includes("lname") ||
    text.includes("surname") ||
    text.includes("family-name") ||
    autocomplete === "family-name"
  ) {
    return "lastName";
  }

  // =========================
  // EMAIL
  // =========================

  if (
    input.type === "email" ||
    text.includes("email") ||
    text.includes("e-mail") ||
    autocomplete === "email"
  ) {
    return "email";
  }

  // =========================
  // PHONE
  // =========================

  if (
    input.type === "tel" ||
    text.includes("phone") ||
    text.includes("mobile") ||
    text.includes("telephone") ||
    text.includes("contact number") ||
    text.includes("phone number") ||
    autocomplete === "tel" ||
    autocomplete === "tel-national"
  ) {
    return "phone";
  }

  // =========================
  // ADDRESS
  // =========================

  if (
    text.includes("address") ||
    text.includes("street") ||
    text.includes("location") ||
    text.includes("residential") ||
    text.includes("home address") ||
    autocomplete === "street-address"
  ) {
    return "address";
  }

  // =========================
  // CITY
  // =========================

  if (
    text.includes("city") ||
    text.includes("town") ||
    text.includes("district") ||
    autocomplete === "address-level2"
  ) {
    return "city";
  }

  // =========================
  // STATE
  // =========================

  if (
    text.includes("state") ||
    text.includes("province") ||
    text.includes("region") ||
    autocomplete === "address-level1"
  ) {
    return "state";
  }

  // =========================
  // PINCODE
  // =========================

  if (
    text.includes("pincode") ||
    text.includes("pin code") ||
    text.includes("postal code") ||
    text.includes("zipcode") ||
    text.includes("zip code") ||
    text.includes("postal") ||
    autocomplete === "postal-code"
  ) {
    return "pincode";
  }

  // =========================
  // LINKEDIN
  // =========================

  if (text.includes("linkedin") || text.includes("linked-in")) {
    return "linkedin";
  }

  // =========================
  // GITHUB
  // =========================

  if (
    text.includes("github") ||
    text.includes("git hub") ||
    text.includes("git-hub")
  ) {
    return "github";
  }

  if (
    text.includes("relocate") ||
    text.includes("relocation") ||
    text.includes("willing to relocate")
  ) {
    return "relocate";
  }
  // =========================
  // GENDER
  // =========================

  if (text.includes("gender") || text.includes("sex")) {
    return "gender";
  }

  // =========================
  // EXPERIENCE
  // =========================

  if (
    text.includes("experience") ||
    text.includes("years of experience") ||
    text.includes("work experience")
  ) {
    return "experience";
  }

  // =========================
  // NOTICE PERIOD
  // =========================

  if (
    text.includes("notice period") ||
    text.includes("notice_period") ||
    text.includes("noticeperiod")
  ) {
    return "noticePeriod";
  }
  if (
    text.includes("terms") ||
    text.includes("agreement") ||
    text.includes("agree")
  ) {
    return "terms";
  }

  return null;
}

function fillRadioGroup(name, value) {
  if (!name || !value) return;

  const radios = document.querySelectorAll(
    `input[type="radio"][name="${name}"]`,
  );

  radios.forEach((radio) => {
    const label = document.querySelector(`label[for="${radio.id}"]`);

    const radioText = `
            ${radio.value || ""}
            ${label ? label.innerText : ""}
        `
      .toLowerCase()
      .trim();

    if (
      radioText === value.toLowerCase() ||
      radioText.includes(value.toLowerCase())
    ) {
      radio.checked = true;

      radio.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );

      console.log("Radio filled:", value);
    }
  });
}

function fillSelect(select, value) {
  if (!select || value === undefined) {
    return;
  }

  const targetValue = String(value).trim().toLowerCase();

  const option = Array.from(select.options).find((option) => {
    return (
      String(option.value).trim().toLowerCase() === targetValue ||
      String(option.textContent).trim().toLowerCase().includes(targetValue)
    );
  });

  if (option) {
    select.value = option.value;

    select.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    select.dispatchEvent(
      new Event("input", {
        bubbles: true,
      }),
    );

    console.log("Dropdown filled:", option.textContent.trim());
  } else {
    console.log("Dropdown option NOT found:", value);
  }
}

function fillCheckbox(input, value) {
  if (!input || !value) return;

  const shouldCheck =
    value === true ||
    value === "true" ||
    value === "yes" ||
    value === "checked";

  if (input.checked !== shouldCheck) {
    input.click();

    console.log("Checkbox filled:", shouldCheck);
  }
}

async function autofillForm() {
  const profile = await getProfile();

  console.log("Project Flow Profile:", profile);

  // =====================================
  // INPUT + TEXTAREA
  // =====================================

  const inputs = document.querySelectorAll(
    "input:not([type='radio']):not([type='checkbox']), textarea",
  );

  inputs.forEach((input) => {
    const field = detectField(input);

    if (field && profile[field] !== undefined) {
      console.log(`Filling ${field}:`, profile[field]);

      fillInput(input, profile[field]);
    }
  });

  // =====================================
  // SELECT / DROPDOWN
  // =====================================

  const selects = document.querySelectorAll("select");

  selects.forEach((select) => {
    const field = detectField(select);

    console.log(
      "SELECT DETECTED:",
      field,
      "VALUE:",
      field ? profile[field] : undefined,
    );

    if (field && profile[field] !== undefined && profile[field] !== "") {
      fillSelect(select, profile[field]);
    }
  });

  // =====================================
  // RADIO
  // =====================================

  const radios = document.querySelectorAll("input[type='radio']");

  const processedGroups = new Set();

  radios.forEach((radio) => {
    const field = detectField(radio);

    console.log(
      "RADIO DETECTED:",
      field,
      "VALUE:",
      field ? profile[field] : undefined,
    );

    if (
      field &&
      profile[field] !== undefined &&
      radio.name &&
      !processedGroups.has(radio.name)
    ) {
      processedGroups.add(radio.name);

      fillRadioGroup(radio.name, profile[field]);
    }
  });

  // =====================================
  // CHECKBOX
  // =====================================

  const checkboxes = document.querySelectorAll("input[type='checkbox']");

  checkboxes.forEach((checkbox) => {
    const field = detectField(checkbox);

    console.log(
      "CHECKBOX DETECTED:",
      field,
      "VALUE:",
      field ? profile[field] : undefined,
    );

    if (field && profile[field] !== undefined) {
      fillCheckbox(checkbox, profile[field]);
    }
  });

  console.log("Project Flow: Form Control Engine completed");
}

autofillForm();
