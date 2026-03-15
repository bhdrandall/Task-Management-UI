# Task Management UI

A React-based frontend for the Task Management API. Provides a modern interface for managing projects, workflows, tasks, stories, and epics with BPMN diagram visualization.

## Features

- **Dashboard** - Overview of projects, tasks, and statistics
- **Projects** - Create and manage projects
- **Workflows** - View and manage workflows with BPMN diagram visualization
- **Tasks** - Full task management with status tracking, filtering, and detail view
- **Stories** - User story management with acceptance criteria
- **Epics** - Epic-level planning and organization

## Tech Stack

- React 19 + TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query (React Query)
- bpmn-js for BPMN diagram rendering
- Lucide React for icons
- Axios for API calls

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (`.env`):
```
VITE_API_URL=http://localhost:8000
VITE_API_KEY=task-mgmt-api-key-2026
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173

## Prerequisites

The Task Management API must be running at the configured `VITE_API_URL`.

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── layout/       # Layout components (Sidebar, Layout)
│   └── BpmnViewer.tsx
├── pages/            # Page components
├── services/         # API client
├── types/            # TypeScript types
└── hooks/            # Custom hooks
```
