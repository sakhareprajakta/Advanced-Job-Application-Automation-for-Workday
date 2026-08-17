

function fillInput(input, value) {
  if (!input || value === undefined || value === null) {
    return;
  }

  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  const textareaSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;

  //  Tell Project Flow this is programmatic filling
  
  input.dataset.projectFlowFilling = "true";

  if (input.tagName === "TEXTAREA" && textareaSetter) {
    textareaSetter.call(input, value);
  } else if (nativeSetter) {
    nativeSetter.call(input, value);
  } else {
    input.value = value;
  }

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

  // Remove filling flag after events are completed
  setTimeout(() => {
    delete input.dataset.projectFlowFilling;
  }, 500);
}


function trackUserInput(input) {
  if (!input) return;

  if (input.dataset.projectFlowTracked === "true") {
    return;
  }

  input.dataset.projectFlowTracked = "true";

  input.addEventListener("input", () => {
    //  Ignore Project Flow generated event
    if (input.dataset.projectFlowFilling === "true") {
      return;
    }

    userModifiedFields.add(input);

    const field = detectField(input);

    if (field) {
      const stableKey = getStableFieldKey(input, field);

      protectedStableFields.add(stableKey);
    }

    console.log("Project Flow: USER MODIFIED → PROTECTED", input.value);
  });

  input.addEventListener("change", () => {
    //  Ignore Project Flow generated event
    if (input.dataset.projectFlowFilling === "true") {
      return;
    }

    userModifiedFields.add(input);

    const field = detectField(input);

    if (field) {
      const stableKey = getStableFieldKey(input, field);

      protectedStableFields.add(stableKey);
    }

    console.log("Project Flow: USER CHANGED → PROTECTED", input.value);
  });
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
    "applicant_first_name",
  ],

  lastName: [
    "lastname",
    "last_name",
    "lname",
    "surname",
    "familyname",
    "family_name",
    "candidate_last_name",
    "applicant_last_name",
  ],

  email: [
    "email",
    "emailaddress",
    "email_address",
    "mail",
    "candidateemail",
    "candidate_email",
    "applicantemail",
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
    "tel",
  ],

  address: [
    "address",
    "street",
    "streetaddress",
    "street_address",
    "residentialaddress",
    "residential_address",
    "homeaddress",
    "home_address",
  ],

  city: ["city", "town", "district"],

  state: ["state", "province", "region"],

  pincode: [
    "pincode",
    "pin",

    "pincode_number",
    "postalcode",
    "postal_code",
    "zipcode",
    "zip_code",
    "zip",
  ],

  linkedin: [
    "linkedin",
    "linkedinurl",
    "linkedin_url",
    "linkedinprofile",
    "linkedin_profile",
  ],

  github: [
    "github",
    "githuburl",
    "github_url",
    "githubprofile",
    "github_profile",
  ],

  gender: ["gender", "sex"],

  experience: [
    "experience",
    "workexperience",
    "work_experience",
    "yearsofexperience",
    "years_of_experience",
    "totalexperience",
    "total_experience",
  ],

  noticePeriod: ["noticeperiod", "notice_period", "notice", "noticeperioddays"],

  relocate: [
    "relocate",
    "relocation",
    "willingtorelocate",
    "willing_to_relocate",
  ],

  terms: [
    "terms",
    "agreement",
    "agree",
    "termsandconditions",
    "terms_and_conditions",
  ],
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
      const normalizedAlias = normalizeFieldText(alias);

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
      ".field-label, .form-label, .label",
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
    labelText,
  });

  // =================================
  // NEARBY SEMANTIC LABEL
  // =================================

  const nearbyLabel = detectNearbyLabel(input);

  if (nearbyLabel) {
    const nearbyField = matchFieldAlias(nearbyLabel);

    if (nearbyField) {
      console.log("Nearby Label Match:", nearbyLabel, "→", nearbyField);

      return nearbyField;
    }
  }

  // =================================
  // PHASE 2: UNIVERSAL ALIAS MATCHING
  // =================================

  const aliasResult = matchFieldAlias(text);

  if (aliasResult) {
    console.log("Universal Alias Match:", text, "→", aliasResult);

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
      radio.dataset.projectFlowFilling = "true";

      radio.checked = true;

      radio.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );

      setTimeout(() => {
        delete radio.dataset.projectFlowFilling;
      }, 500);

      console.log("Radio filled:", value);
    }
  });
}

function fillSelect(select, value) {
  if (!select || value === undefined || value === null) {
    return;
  }

  const targetValue = String(value).trim().toLowerCase();

  const option = Array.from(select.options).find((option) => {
    return (
      String(option.value).trim().toLowerCase() === targetValue ||
      String(option.textContent).trim().toLowerCase().includes(targetValue)
    );
  });

  if (!option) {
    console.log("Dropdown option NOT found:", value);

    return;
  }

  select.dataset.projectFlowFilling = "true";

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

  setTimeout(() => {
    delete select.dataset.projectFlowFilling;
  }, 500);

  console.log("Dropdown filled:", option.textContent.trim());
}

function fillCheckbox(input, value) {
  if (!input || !value) return;

  const shouldCheck =
    value === true ||
    value === "true" ||
    value === "yes" ||
    value === "checked";

  if (input.checked !== shouldCheck) {
    input.dataset.projectFlowFilling = "true";

    input.click();

    setTimeout(() => {
      delete input.dataset.projectFlowFilling;
    }, 500);

    console.log("Checkbox filled:", shouldCheck);
  }
}



// =====================================
// FIELD PROCESSING CONTROL
// =====================================
const processedFields = new WeakSet();

const processedStableFields = new Set();
const protectedStableFields = new Set();

const protectedFieldTypes = new Set();

const userModifiedFields = new WeakSet();

let isProjectFlowFilling = false;

function getFieldIdentifier(input) {
  if (!input) return "";

  return (
    input.name ||
    input.id ||
    input.getAttribute("data-testid") ||
    input.getAttribute("aria-label") ||
    ""
  ).toLowerCase();
}

// =====================================
// STABLE FIELD KEY
// =====================================

function getStableFieldKey(input, field) {
  if (!input) return "";

  const name = input.name || "";
  const id = input.id || "";

  return `${field || "unknown"}|${name}|${id}`;
}

function shouldFillField(input, field) {
  if (!input) return false;

  // =====================================
  // 1. SAME DOM ELEMENT ALREADY PROCESSED
  // =====================================

  if (processedFields.has(input)) {
    console.log("Skipping duplicate field:", input);
    return false;
  }

  // =====================================
  // 2. USER / PAGE ALREADY HAS VALUE
  // =====================================

  if (input.value && input.value.trim() !== "") {
    console.log("Skipping pre-filled field:", field, "VALUE:", input.value);

    // Protect this field type
    if (field) {
      protectedFieldTypes.add(field);
    }

    processedFields.add(input);

    return false;
  }

  // =====================================
  // 3. SAME FIELD TYPE WAS ALREADY
  //    PROTECTED BY USER DATA
  // =====================================

  if (field && protectedFieldTypes.has(field)) {
    console.log("Skipping protected field type:", field);

    processedFields.add(input);

    return false;
  }

  return true;
}

function markFieldProcessed(input) {
  if (input) {
    processedFields.add(input);
  }
}

autofillForm();

// =====================================
// STAGE 6A: OPTIMIZED DYNAMIC FIELD
// PROCESSING
// =====================================

let dynamicTimer = null;

function processNewNode(node) {
  // Ignore non-element nodes
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  // =====================================
  // 1. NODE ITSELF IS A FORM FIELD
  // =====================================

  if (node.matches("input, textarea, select")) {
    processSingleField(node);
  }

  // =====================================
  // 2. NODE CONTAINS NEW FORM FIELDS
  // =====================================

  const fields = node.querySelectorAll("input, textarea, select");

  fields.forEach((field) => {
    processSingleField(field);
  });
}

async function processSingleField(input) {
  if (!input) return;

  // =====================================
  // TRACK USER INPUT
  // =====================================

  trackUserInput(input);

  // =====================================
  // DETECT FIELD
  // =====================================

  const field = detectField(input);

  if (!field) {
    console.log("Project Flow: Unable to detect new field");

    return;
  }

  // =====================================
  // STABLE FIELD KEY
  // =====================================

  const stableKey = getStableFieldKey(input, field);

  // =====================================
  // USER MODIFIED EXACT ELEMENT
  // =====================================

  if (userModifiedFields.has(input)) {
    console.log("Project Flow: USER PROTECTED → SKIP", field, input.value);

    return;
  }

  // =====================================
  // USER PROTECTED STABLE FIELD
  // =====================================

  if (protectedStableFields.has(stableKey)) {
    console.log("Project Flow: STABLE FIELD PROTECTED → SKIP", stableKey);

    return;
  }

  // =====================================
  // EXISTING VALUE
  // =====================================

  if (input.value && input.value.trim() !== "") {
    console.log("Project Flow: Existing value → SKIP", field, input.value);

    return;
  }

  // =====================================
  // GET PROFILE
  // =====================================

  const profile = await getProfile();

  const value = profile[field];

  // =====================================
  // NO PROFILE VALUE
  // =====================================

  if (value === undefined || value === null || value === "") {
    console.log("Project Flow: No profile value:", field);

    return;
  }

  // =====================================
  // MARK PROCESSED
  // =====================================

  processedFields.add(input);

  console.log("Project Flow: NEW dynamic field detected:", field, input);

  // =====================================
  // INPUT / TEXTAREA
  // =====================================

  if (
    input.matches("input:not([type='radio']):not([type='checkbox']), textarea")
  ) {
    console.log(`Project Flow: Dynamic fill ${field}:`, value);

    fillInput(input, value);

    return;
  }

  // =====================================
  // SELECT
  // =====================================

  if (input.matches("select")) {
    console.log(`Project Flow: Dynamic dropdown ${field}:`, value);

    fillSelect(input, value);

    return;
  }

  // =====================================
  // RADIO
  // =====================================

  if (input.matches("input[type='radio']")) {
    if (input.name) {
      fillRadioGroup(input.name, value);
    }

    return;
  }

  // =====================================
  // CHECKBOX
  // =====================================

  if (input.matches("input[type='checkbox']")) {
    fillCheckbox(input, value);

    return;
  }
}

// =====================================
// MUTATION OBSERVER
// =====================================
const observer = new MutationObserver((mutations) => {
  clearTimeout(dynamicTimer);

  dynamicTimer = setTimeout(() => {
    console.log("Project Flow: DOM changed → collecting ONLY new fields");

    const newFields = new Set();

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        // If added node itself is a field
        if (node.matches("input, textarea, select")) {
          newFields.add(node);
        }

        // If added node contains fields
        node.querySelectorAll("input, textarea, select").forEach((field) => {
          newFields.add(field);
        });
      });
    });

    console.log("Project Flow: New unique fields:", newFields.size);

    newFields.forEach((field) => {
      processSingleField(field);
    });
  }, 300);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

console.log("Project Flow: Optimized Dynamic Observer started");
