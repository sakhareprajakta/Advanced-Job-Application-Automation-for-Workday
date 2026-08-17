
let savedProfile = {};
async function autofillForm() {

  console.log("🔥 AUTOFILL FORM STARTED");

  const profile = await getProfile();

  console.log("Project Flow Profile:", profile);

  // =====================================
  // INPUT + TEXTAREA
  // =====================================

  const inputs = document.querySelectorAll(
    "input:not([type='radio']):not([type='checkbox']), textarea",
  );

  inputs.forEach((input) => {
    trackUserInput(input);

    const field = detectField(input);

    if (!field) {
      console.log("Project Flow: Unable to detect new field");
      return;
    }

    const stableKey = getStableFieldKey(input, field);

    if (protectedStableFields.has(stableKey)) {
      console.log("Project Flow: STABLE FIELD PROTECTED → SKIP", stableKey);

      return;
    }

    // =====================================
    // USER MODIFIED THIS EXACT ELEMENT
    // =====================================

    if (userModifiedFields.has(input)) {
      console.log("Project Flow: USER PROTECTED → SKIP", field, input.value);

      return;
    }

    // =====================================
    // STABLE FIELD PROTECTION
    // =====================================

    // 🔒 Existing value protection
    if (input.value && input.value.trim() !== "") {
      console.log("Project Flow: Existing value → SKIP", field, input.value);

      return;
    }

    if (profile[field] !== undefined) {
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


async function loadProfileFromAPI() {

  console.log("🔥 API FUNCTION STARTED");

  try {
    const response = await fetch(
      "http://localhost:5000/api/profile"
    );

    console.log("🔥 API STATUS:", response.status);

    const profile = await response.json();

    console.log("🔥 API PROFILE:", profile);

    savedProfile = profile;

    return profile;

  } catch (error) {
    console.error("🔥 API ERROR:", error);
    return null;
  }
}





function getProfile() {
  console.log("🔥 GET PROFILE CALLED");
  return loadProfileFromAPI();
}

