# Kanello

Welcome to **Kanello**, a modern, full-stack collaborative Kanban board and task management platform (inspired by Trello). Kanello is built with a decoupled architecture featuring a React SPA frontend, an Express.js backend, Firestore database storage, Firebase Authentication, and Firebase Cloud Functions for external integrations (such as GitHub sync).

## Screenshots & UI Gallery

Below are some screenshots showing the Kanello interface and workflow:

<p align="center">
  <img src="screenshot/Screenshot%202026-06-21%20194752.png" width="45%" alt="Screenshot 1" />
  <img src="screenshot/Screenshot%202026-06-21%20195059.png" width="45%" alt="Screenshot 2" />
</p>
<p align="center">
  <img src="screenshot/Screenshot%202026-06-21%20195120.png" width="45%" alt="Screenshot 3" />
  <img src="screenshot/Screenshot%202026-06-21%20195127.png" width="45%" alt="Screenshot 4" />
</p>
<p align="center">
  <img src="screenshot/Screenshot%202026-06-21%20195136.png" width="45%" alt="Screenshot 5" />
  <img src="screenshot/Screenshot%202026-06-21%20195150.png" width="45%" alt="Screenshot 6" />
</p>
<p align="center">
  <img src="screenshot/Screenshot%202026-06-21%20195200.png" width="45%" alt="Screenshot 7" />
  <img src="screenshot/Screenshot%202026-06-21%20195223.png" width="45%" alt="Screenshot 8" />
</p>
<p align="center">
  <img src="screenshot/Screenshot%202026-06-21%20195300.png" width="45%" alt="Screenshot 9" />
  <img src="screenshot/Screenshot%202026-06-21%20195307.png" width="45%" alt="Screenshot 10" />
</p>
<p align="center">
  <img src="screenshot/Screenshot%202026-06-21%20195323.png" width="90%" alt="Screenshot 11" />
</p>

---

## Architecture & Structure

Kanello is structured as a monorepo containing three primary modules:

```text
kanello/
├── front-end/        # React 19 Single Page Application (Vite + TypeScript)
├── back-end/         # Express.js server (Node.js + Firebase Admin SDK)
└── functions/         # Firebase Cloud Functions (v2 HTTPS Callables for GitHub API integrations)
```

### 1. Front-End (`/front-end`)
- **Core**: React 19, Vite, TypeScript, React Router v7.
- **Styling**: Bootstrap 5 (for layout grid and utility spacing) combined with custom Vanilla CSS variables for dark-mode aesthetic and modular components.
- **Client API**: Pre-configured Axios instance that automatically forwards Firebase Auth ID tokens as Bearer tokens to the back-end.

### 2. Back-End (`/back-end`)
- **Core**: Node.js & Express.js.
- **Database & Auth**: Utilizes the Firebase Admin SDK to interact directly with Firestore collections (`users`, `boards`, `invitations`, `cards`, etc.) and verify incoming client JWT ID tokens.
- **Services**: Nodemailer support for sending security and authentication emails.

### 3. Functions (`/functions`)
- **Core**: Firebase Functions v2.
- **Service**: Secure HTTPS callables (`getGithubInfo`) designed to communicate with the GitHub API using users' stored GitHub OAuth tokens to retrieve branch, PR, issue, and commit details.

---

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

---

## Configuration & Environment Setup

Each folder contains specific configuration templates. Follow the guides below to set up your environment:

### 1. Firebase Project Configuration
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project named **Kanello**.
2. **Database Setup**: Enable **Cloud Firestore** in test or production mode and select your region.
3. **Authentication Setup**: Enable Email/Password provider.
4. **Service Account Key**:
   - Navigate to **Project Settings > Service Accounts**.
   - Click **Generate new private key** and download the JSON file.
   - Save this file inside `back-end/` as `firebase-service-account.json`.

---

### 2. Back-End Configuration (`/back-end`)
Create a `back-end/.env` file using the following template:

```env
# GitHub App OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Local/Fallback JWT Secret
JWT_SECRET=your-fallback-secret-key

# Nodemailer / SMTP Config
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
```

### 3. Front-End Configuration (`/front-end`)
Create a `front-end/.env` file using your Firebase Web App credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyB-exampleApiKey
VITE_FIREBASE_AUTH_DOMAIN=kanello.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kanello
VITE_FIREBASE_STORAGE_BUCKET=kanello.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:exampleAppId
VITE_FIREBASE_MEASUREMENT_ID=G-exampleMeasurementId
```

---

## Running the Project Locally

### 1. Run the Backend Server
Navigate to the `back-end` directory, install dependencies, and start the development server:
```bash
cd back-end
npm install
npm start
```
The back-end server runs on `http://localhost:3000` (configurable through `bin/www` or environments).

### 2. Run the React Frontend
Open a new terminal session, navigate to the `front-end` directory, install dependencies, and launch Vite's HMR dev server:
```bash
cd front-end
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Firebase Cloud Functions Locally
To run and test the Cloud Functions locally using the Firebase emulator:
```bash
cd functions
npm install
firebase emulators:start --only functions
```

---

## Coding & Component Guidelines

### Styling & Theme Design
- **Bootstrap 5 & Vanilla CSS**: Leverage Bootstrap 5 for standard layout grids (containers, rows, columns), flexbox configurations, and common utility spacing. Combine it with custom Vanilla CSS for component-specific styles, customized states, and global design token overrides defined in `index.css`.
- **Theme Variables**: Use design tokens declared as CSS custom properties in `index.css` to maintain consistent colors, sizing, and premium dark-mode styling variables.

### Modularity & Architecture
- **Component Modularity**: Place reusable UI components (e.g., `Button`, `Input`, `Modal`) inside `front-end/src/components/ui/`. Store page-specific components in their respective `pages/<PageName>/components/` folders.

### API & Data Fetching
- **Centralized Client**: Do not write raw, unauthenticated `fetch` or `axios` operations directly in UI components. Use the modular API modules configured inside `front-end/src/api/` which automatically sign and format request headers with Firebase Auth ID tokens.

