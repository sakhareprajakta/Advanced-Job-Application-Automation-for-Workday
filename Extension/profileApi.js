
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
    console.log(
  "PROJECT FLOW MAPPING:",
  input.id,
  "→",
  field,
  "→",
  profile[field]
);

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

    if (profile[field] !== undefined && profile[field] !== "") {
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

    if (
      field &&
      profile[field] !== undefined &&
      profile[field] !== "" &&
      !select.value
    ) {
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
      !radio.checked &&
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

    // Agreement/terms checkboxes require an explicit user action. Never
    // accept them automatically on the user's behalf.
    if (
      field &&
      field !== "terms" &&
      profile[field] !== undefined &&
      !checkbox.checked
    ) {
      fillCheckbox(checkbox, profile[field]);
    }
  });

  console.log("Project Flow: Form Control Engine completed");
}


function getProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (profile) => {
      if (chrome.runtime.lastError) {
        console.error("Project Flow: unable to read the saved profile", chrome.runtime.lastError);
        resolve({});
        return;
      }

      resolve(profile);
    });
  });
}

