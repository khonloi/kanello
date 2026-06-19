# Kanello Front-End

Welcome to the front-end application of **Kanello**, a collaborative board and task management platform (inspired by Trello) built using React, TypeScript, and Vite.

This application connects to a backend API to let users organize tasks into cards and boards, manage list hierarchies, and invite team members.

---

## Quick Start

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Navigate to the `front-end` directory:
   ```bash
   cd front-end
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To launch the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at the port output in your terminal (typically `http://localhost:5173`).

### Building for Production

To type-check and bundle the project for production deployment:

```bash
npm run build
```

The compiled output will be generated inside the `dist` directory.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool / Bundler**: [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Bootstrap 5](https://getbootstrap.com/) (layout & utilities) & custom Vanilla CSS
- **Icons**: [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Forms & Validation**: [Zod](https://zod.dev/)

---

## Project Structure

```text
front-end/
├── src/
│   ├── api/                  # API client & services
│   │   ├── client.ts         # Axios/Fetch wrapper with auth tokens
│   │   ├── auth.ts           # Authentication requests (Login, Register)
│   │   ├── boards.ts         # Board CRUD operations
│   │   ├── cards.ts          # Card CRUD operations
│   │   ├── tasks.ts          # Task details and items inside cards
│   │   └── invitations.ts    # Board collaboration & member invitations
│   │
│   ├── components/
│   │   └── ui/               # Reusable UI component library
│   │       ├── Button/       # Custom buttons
│   │       ├── Card/         # Custom container cards
│   │       ├── Grid/         # Flexbox/Grid helpers
│   │       ├── Input/        # Dynamic input text fields
│   │       ├── Modal/        # Custom popup/modal system
│   │       ├── Navbar/       # Global navigation headers
│   │       ├── Sidebar/      # Board list and member roster sidebar
│   │       └── Textarea/     # Auto-expanding area fields
│   │
│   ├── pages/                # Application views/routes
│   │   ├── Auth/             # Login & Registration flows
│   │   ├── Home/             # Dashboard listing user's boards
│   │   └── Board/            # Full Board page view
│   │       ├── components/   # Board-specific component sub-elements
│   │       │   ├── CardDetailsModal.tsx # Full-screen edit view for tasks/cards
│   │       │   ├── CardItem.tsx         # Individual lists containing tasks
│   │       │   └── TaskItem.tsx         # Individual draggable task rows
│   │       ├── InvitationsModal.tsx     # Invite management (Owner exclusive)
│   │       └── TaskDetailsModal.tsx     # Task item specific configuration
│   │
│   ├── App.tsx               # Main application routing and core layouts
│   ├── main.tsx              # Application entry point & styles import
│   ├── index.css             # Global stylesheet & design token declarations
│   └── App.css               # Base layout styling
│
├── vite.config.ts            # Vite configuration details
├── tsconfig.json             # TypeScript base rules
└── package.json              # Project script & package dependencies
```

---

## Key Features Included

1. **Authentication Flow**
   - User Registration & Login with validation powered by Zod.
   - JWT-based authentication persisted via local storage.

2. **Workspace & Board Management**
   - Create, customize, and delete workspaces/boards.
   - Sidebar listing all boards user belongs to.

3. **Lists & Cards**
   - Organize boards into Lists (e.g., _To Do_, _In Progress_, _Done_).
   - Create cards containing task items.
   - Access Card/Task Detail modals to modify descriptions, titles, and subtasks.

4. **Collaboration & Permissions**
   - Invitation modals for adding other users as members.
   - Strict security controls: **only the Board Owner** can invite new members to a board.

---

## Coding Guidelines

- **Vanilla CSS styling**: Define layout-level styles and themes inside dedicated CSS files (e.g., `BoardPage.css`, `InvitationsModal.css`) rather than relying on heavy inline/ad-hoc utility libraries.
- **Component Modularity**: Keep page-specific components in their respective `pages/<PageName>/components/` folder and generic items in `components/ui/`.
- **API Wrapper**: Avoid raw fetch requests inside components. Utilize the pre-configured endpoints defined in [src/api/](file:///d:/Project/trolle/front-end/src/api/).
