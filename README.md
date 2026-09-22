Advanced Job Application Automation for Workday

A Chrome Extension--based automation project designed to intelligently
detect, map, and autofill complex job application forms, with a focus
on Workday's dynamic, multi-step application experience.



1. Project Overview

Advanced Job Application Automation for Workday is a
browser-extension project that reduces repetitive manual work while
completing job applications.

Workday applications can contain dynamically rendered fields, different
labels for the same information, dropdowns, radio buttons, checkboxes,
conditional sections, and multi-step pages.

Instead of depending only on fixed selectors, the project uses a
field-detection and mapping approach.

DOM Information
      ↓
Field Detection
      ↓
Canonical Field Name
      ↓
Profile Data
      ↓
Form Control
      ↓
Autofill

Example:

"Given Name"              → firstName
"Family Name"             → lastName
"Email Address"            → email
"Mobile Number"            → phone
"Postal Code"              → pincode
"Years of Experience"      → experience

2. Problem I Solved

A simple autofill script may depend on a fixed selector:

<input id="firstName">

But the same logical field can later appear as:

<input name="candidateFirstName">

or:

<input aria-label="Given Name">

The project therefore reads multiple signals:

name

id

placeholder

aria-label

autocomplete

associated label text

These signals are normalized and mapped to a standard internal profile
key.

3. Main Features

Core automation

Chrome Extension using Manifest V3

Profile-based autofill

Automatic field detection

Universal field alias matching

Text input and textarea handling

Dropdown/select handling

Radio button handling

Checkbox handling

LinkedIn and GitHub autofill

Experience and notice-period mapping

Relocation and gender mapping

Terms/agreement checkbox handling

Dynamic form handling

The extension uses MutationObserver.

DOM changes
    ↓
MutationObserver
    ↓
New fields collected
    ↓
Field detection
    ↓
Profile mapping
    ↓
Autofill

This allows newly rendered controls to be processed without a page
refresh.

4. User Override Protection

The extension tracks manual user changes.

Example:

Extension fills:
First Name = Prajakta

User changes it:
First Name = Rohit

DOM changes again

The manually changed value remains protected instead of being blindly
overwritten.

5. Dynamic Field Reliability

The project was tested for:

Add dynamic field
      ↓
Autofill
      ↓
Remove field
      ↓
Add same logical field again
      ↓
Autofill again

The observer also collects newly added elements in a Set so the same
DOM element is not unnecessarily processed multiple times during a
mutation batch.

6. Universal Field Detection

Examples:

Website Field          Internal Key

First Name             firstName
Given Name             firstName
Candidate First Name   firstName
Family Name            lastName
Surname                lastName
Email Address          email
Mobile Number          phone
Street Address         address
City                   city
Province               state
Postal Code            pincode
LinkedIn Profile       linkedin
GitHub Profile         github
Years of Experience    experience
Notice Period          noticePeriod
Willing to Relocate    relocate

7. Architecture

                         ┌─────────────────────────┐
                         │       Job Website       │
                         │   Workday / Test Form   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      Chrome Extension   │
                         │       content.js        │
                         └────────────┬────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
                 ▼                    ▼                    ▼
          Field Detection      Alias Matching      MutationObserver
                 │                    │                    │
                 └────────────────────┼────────────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │   Canonical Field Key   │
                         │ firstName / email / ... │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      Profile Data       │
                         │ Chrome Storage / API    │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │     Form Control        │
                         │ input/select/radio/etc. │
                         └─────────────────────────┘

8. Project Structure

WorkdayAutomation/
│
├── Backend/
│   ├── Server.js
│   ├── models/
│   │   └── Profile.js
│   ├── package.json
│   └── package-lock.json
│
├── Extension/
│   ├── content.js
│   ├── fieldDitector.js
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── profileApi.js
│   └── test-form.html
│
├── popup/
│   ├── src/
│   │   └── App.jsx
│   └── ...
│
├── docs/
│   └── screenshots/
│
├── .gitignore
└── README.md

9. File Responsibilities

Extension/manifest.json

Defines the Chrome Extension configuration, permissions, content scripts
and page matching rules.

Extension/content.js

The core automation engine.

It is responsible for:

detecting form controls

extracting field metadata

mapping fields to profile keys

filling controls

dropdown/radio/checkbox handling

tracking user changes

observing dynamically added fields

Important concepts/functions include:

detectField()
processSingleField()
autofillForm()
MutationObserver
trackUserInput()
alias matching

Extension/fieldDitector.js

Contains field-detection logic as the project is being modularized.

Extension/popup.html

Extension popup UI.

Extension/popup.js

Handles extension-side profile interaction and communication with
storage/API.

Extension/profileApi.js

API communication layer between the extension and backend profile
services.

Extension/test-form.html

Local test environment for validating text fields, dropdowns, radio
buttons, checkboxes, dynamic fields, remove/re-add behavior and user
edits.

Backend/Server.js

Node.js + Express backend entry point for profile-related APIs.

Backend/models/Profile.js

Profile data model.

popup/src/App.jsx

React-based popup/dashboard layer for profile management and UI
expansion.

10. End-to-End Workflow

Step 1 --- Profile

The user provides profile information.

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

Step 2 --- Open job application

The content script runs on the application page.

Workday Page
      ↓
content.js

Step 3 --- Scan controls

The extension identifies:

input
textarea
select
radio
checkbox

Step 4 --- Detect field

Example:

"Candidate First Name"
          ↓
       firstName

Step 5 --- Retrieve value

firstName
   ↓
profile.firstName
   ↓
Prajakta

Step 6 --- Fill control

Text Input       → set value
Textarea         → set value
Select           → select option
Radio            → select radio
Checkbox         → check/uncheck

Relevant DOM events are dispatched so web applications can recognize
programmatic changes.

11. Dynamic DOM Workflow

Suppose the page initially contains:

First Name
Last Name
Email

Later JavaScript adds:

Phone

The extension can react without a page reload:

New DOM element
      ↓
MutationObserver
      ↓
processSingleField()
      ↓
detectField()
      ↓
Map profile value
      ↓
Autofill

This is important because modern web applications often render controls
asynchronously.

12. Technology Stack

Browser Automation

Chrome Extension

Manifest V3

JavaScript

DOM APIs

MutationObserver

Frontend

React.js

JavaScript

Vite

Backend

Node.js

Express.js

REST APIs

Data Layer

MongoDB

MySQL

Development

Git

GitHub

VS Code

Chrome DevTools

Postman

13. AI / Intelligent Automation Direction

The original assignment describes an AI-driven architecture involving
resume parsing and semantic field mapping.

The intended high-level flow is:

Resume
  ↓
Resume Parsing
  ↓
Structured JSON
  ↓
Field Understanding
  ↓
Semantic Mapping
  ↓
Workday Autofill
  ↓
Review
  ↓
User Confirmation
  ↓
Submit

Accuracy note: the currently verified core is focused on
heuristic/alias-based field detection, dynamic DOM handling, reliable
autofill and user protection. AI-based resume parsing/semantic mapping
should only be described as implemented when that integration is
actually enabled in the version being demonstrated.

14. Testing

The local test form covers:

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

Experience dropdown

Notice Period dropdown

Gender radio buttons

Relocation radio buttons

Terms checkbox

Dynamic tests:

Add → detect → autofill
Remove → re-add → detect → autofill

User-edit test:

Extension: Prajakta
User: Rohit
Expected: Rohit remains unchanged

15. Run the Project

Backend

cd Backend
npm install
npm start

Use the actual script in Backend/package.json if it differs.

React popup

cd popup
npm install
npm run dev

Vite will provide a local URL such as:

http://localhost:5173/

Load the Chrome Extension

Open Chrome.

Go to chrome://extensions/.

Enable Developer mode.

Click Load unpacked.

Select:

WorkdayAutomation/Extension

Pin the extension.
