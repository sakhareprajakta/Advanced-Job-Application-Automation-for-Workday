::: {align="center"}

🚀 Advanced Job Application Automation for Workday

🤖 Smart Chrome Extension for Dynamic Job Application Forms

Detect • Understand • Map • Autofill • Observe • Protect

<br>{=html}








<br>{=html}

💡 A real-world browser automation project that intelligently
detects job-application fields instead of depending only on fixed HTML
selectors.
:::

📌 Table of Contents

🎯 Project Overview

💡 Problem Statement

✨ Key Features

🧠 How the Automation Works

🔎 Smart Field Detection

⚡ Dynamic Field Handling

🛡️ User Override Protection

🏗️ Architecture

📁 Project Structure

🔄 Complete Project Flow

🧪 Testing

🖥️ Live Demo

📸 Screenshots

🛠️ Technology Stack

🚀 Setup

🎤 Interview Explanation

🔮 Future Improvements

🔐 Privacy & Safety

👩‍💻 Author

🎯 Project Overview

Advanced Job Application Automation for Workday is a Chrome
Extension-based automation system created to reduce repetitive work
while filling complex job-application forms.

Modern application platforms can contain:

🔄 Dynamically rendered fields

🏷️ Different labels for the same information

🔽 Dropdowns

🔘 Radio buttons

☑️ Checkboxes

🧩 Conditional sections

📄 Multi-step application flows

⚡ Fields that appear after user interaction

The project solves this by creating a field-detection → mapping →
autofill pipeline.

⭐ Core Idea

┌─────────────────────┐
│   Web Application   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Detect DOM Field  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Normalize / Alias   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Canonical Field Key │
│ firstName / email   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Candidate Profile   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│     Autofill        │
└─────────────────────┘

💡 Problem Statement

A basic autofill script might depend on:

<input id="firstName">

But another application may use:

<input name="candidateFirstName">

or:

<input aria-label="Given Name">

All three represent the same business field.

❌ Fragile approach

#firstName
#email
#phone

If the website changes the ID, the automation can break.

✅ Project approach

The extension checks multiple signals:

DOM Signal       Example

name           candidateFirstName
id             first_name
placeholder    Enter your first name
aria-label     Given Name
autocomplete   given-name
Label text       First Name

These signals are normalized and mapped to a common profile key.

✨ Key Features

Feature                             What it does

🧠 Smart field detection            Identifies fields using multiple
DOM signals

🔗 Alias matching                   Maps different field names to one
profile key

✍️ Text autofill                    Fills input and textarea controls

🔽 Dropdown support                 Selects matching options

🔘 Radio support                    Selects the correct radio option

☑️ Checkbox support                 Handles agreement/terms fields

⚡ Dynamic DOM support              Detects newly rendered fields

👤 User-input tracking              Protects manually edited values

🔄 Re-processing                    Handles fields added again later

🧪 Local test environment           Tests automation without depending
on a live application

🌐 API layer                        Connects extension profile data
with backend services

🧠 How the Automation Works

Example

Suppose the webpage contains:

<input
    name="candidateFirstName"
    aria-label="Given Name"
/>

The extension processes it like this:

candidateFirstName
        +
Given Name
        ↓
Field Detection
        ↓
Alias Matching
        ↓
firstName
        ↓
profile.firstName
        ↓
"Prajakta"
        ↓
Input Filled

In simple words

The extension does not simply ask "What is the ID of this field?" It
asks "What information is this field requesting?"

That is the main engineering idea behind the project.

🔎 Smart Field Detection

The detector collects information from:

name
id
value
placeholder
aria-label
autocomplete
associated label
parent label

Example mappings

Website may say          Internal key

First Name               firstName
Given Name               firstName
Candidate First Name     firstName
Family Name              lastName
Surname                  lastName
Email Address            email
Mobile Number            phone
Telephone                phone
Street Address           address
City / Town              city
Province / Region        state
Postal Code / ZIP Code   pincode
LinkedIn Profile         linkedin
GitHub Profile           github
Years of Experience      experience
Notice Period            noticePeriod
Willing to Relocate      relocate

Normalization concept

For example:

Candidate_First_Name
candidate-first-name
Candidate First Name
candidateFirstName

can be normalized so that different naming styles can be recognized as
the same logical field.

⚡ Dynamic Field Handling

This is one of the most important technical parts of the project.

Modern web applications often create fields after the initial page
load.

Without dynamic observation

Page loads
   ↓
Scan fields
   ↓
Done ❌

A field added later may be missed.

With MutationObserver

Page loads
   ↓
Initial field scan
   ↓
User interacts with page
   ↓
New DOM element appears
   ↓
MutationObserver detects it
   ↓
processSingleField()
   ↓
detectField()
   ↓
Profile mapping
   ↓
Autofill

Why I used MutationObserver

MutationObserver lets the extension react to DOM changes without
repeatedly refreshing or continuously scanning the entire page.

🛡️ User Override Protection

Automation should not fight with the user.

Example:

Extension fills:
First Name = Prajakta

        ↓

User manually changes:
First Name = Rohit

        ↓

Another DOM change occurs

        ↓

Automation checks user interaction

        ↓

Rohit remains unchanged ✅

This is handled using user-input tracking.

Interview point

"I wanted the automation to remain user-controlled, so I added logic
to distinguish extension-generated values from values intentionally
changed by the user."

🔄 Dynamic Add / Remove / Re-add Test

The automation was tested against this scenario:

Add Dynamic Field
        ↓
Detect Field
        ↓
Autofill
        ↓
Remove Field
        ↓
Add Field Again
        ↓
Detect Again
        ↓
Autofill Again

This helps validate that the automation is not limited to a one-time
page scan.

🏗️ Architecture

flowchart TD
    A[Job Application Page] --> B[Chrome Extension]
    B --> C[content.js]
    C --> D[DOM Field Detection]
    C --> E[Alias Matching]
    C --> F[MutationObserver]

    D --> G[Canonical Field Key]
    E --> G
    F --> D

    G --> H[Candidate Profile]
    H --> I[Form Control]

    J[React Popup] --> K[Profile Management]
    K --> L[REST API]
    L --> M[Node.js + Express]
    M --> N[(MongoDB / MySQL)]
    H -. API / Storage .-> K

Architecture in simple language

React Popup
     ↓
Profile
     ↓
API / Storage
     ↓
Chrome Extension
     ↓
content.js
     ↓
Field Detection
     ↓
Alias Mapping
     ↓
Autofill
     ↓
Dynamic Observation

📁 Project Structure

WorkdayAutomation/
│
├── 📂 Backend/
│   ├── 📄 Server.js
│   ├── 📂 models/
│   │   └── 📄 Profile.js
│   ├── 📄 package.json
│   └── 📄 package-lock.json
│
├── 📂 Extension/
│   ├── 📄 content.js
│   ├── 📄 fieldDitector.js
│   ├── 📄 manifest.json
│   ├── 📄 popup.html
│   ├── 📄 popup.js
│   ├── 📄 profileApi.js
│   └── 📄 test-form.html
│
├── 📂 popup/
│   ├── 📂 src/
│   │   └── ⚛️ App.jsx
│   └── ...
│
├── 📂 docs/
│   └── 📂 screenshots/
│       ├── 🖼️ 01-extension-popup.png
│       ├── 🖼️ 02-test-form-before.png
│       ├── 🖼️ 03-autofill-result.png
│       ├── 🖼️ 04-dynamic-field.png
│       ├── 🖼️ 05-user-override.png
│       ├── 🖼️ 06-console.png
│       └── 🖼️ 07-content-engine.png
│
├── 📄 .gitignore
└── 📄 README.md

🧩 Major File Responsibilities

Extension/manifest.json

Defines the Chrome Extension configuration:

Manifest V3

Permissions

Content scripts

Page matching

Extension resources

Extension/content.js

🚨 Core automation engine

Responsible for:

DOM scanning

Field detection

Field mapping

Autofill

Dropdown handling

Radio handling

Checkbox handling

User-input tracking

Dynamic field processing

Important concepts:

detectField()
processSingleField()
autofillForm()
MutationObserver
trackUserInput()
Alias matching

Extension/fieldDitector.js

Contains field-detection-related logic as the project is being
modularized.

Extension/popup.html

Provides the extension popup interface.

Extension/popup.js

Handles extension-side profile interaction and communication with
storage/API.

Extension/profileApi.js

Provides the API communication layer between the extension and backend
profile services.

Extension/test-form.html

🧪 Local testing environment.

Used to test:

Text inputs

Textareas

Dropdowns

Radio buttons

Checkboxes

Dynamic fields

Remove/re-add behavior

User edits

Backend/Server.js

Node.js + Express backend entry point for profile-related API
functionality.

Backend/models/Profile.js

Defines the profile data model.

popup/src/App.jsx

React-based popup/dashboard layer for profile management and future UI
expansion.

🔄 Complete Project Flow

1️⃣ User Profile

{
  "firstName": "Prajakta",
  "lastName": "Sakhare",
  "email": "example@gmail.com",
  "phone": "9876543210",
  "city": "Pune",
  "state": "Maharashtra",
  "experience": "2",
  "noticePeriod": "Immediate"
}

2️⃣ Open application

Job Application
      ↓
Chrome Extension
      ↓
content.js

3️⃣ Scan controls

<input>
<textarea>
<select>
<input type="radio">
<input type="checkbox">

4️⃣ Detect field

"Candidate First Name"
          ↓
       firstName

5️⃣ Retrieve profile value

firstName
   ↓
profile.firstName
   ↓
Prajakta

6️⃣ Fill the correct control

Text input  → Value
Select      → Option
Radio       → Choice
Checkbox    → Checked state

7️⃣ Watch for new fields

MutationObserver
       ↓
New field
       ↓
Process
       ↓
Detect
       ↓
Fill

🧪 Testing

✅ Fields tested

First Name

Last Name

Email

Phone

Address

City

State

Pincode

LinkedIn

GitHub

Experience

Notice Period

Gender

Relocation

Terms

🔬 Dynamic tests

Add → Detect → Autofill
Remove → Re-add → Detect → Autofill

👤 User override test

Extension:
Prajakta

User:
Rohit

Result:
Rohit remains unchanged ✅
