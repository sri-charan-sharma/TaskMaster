# TaskMaster — Project Workflow & Task Dependency Engine

[![Node.js](https://img.shields.io/badge/Node.js-22+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/SQLite-node:sqlite%20WAL-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![UI Design](https://img.shields.io/badge/Design-Awwwards%20%2F%20Milj%C3%B8fyrt%C3%A5rn-14e894)](https://www.awwwards.com/sites/miljofyrtarn)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A deliberate, high-craft project management and workflow system with **automated task dependency resolution (DAG)**, **multi-stage status pipelines**, and **native SQLite persistence**.

Designed with a **Scandinavian Awwwards-grade aesthetic** inspired by **Miljøfyrtårn** (*Good Morning Oslo*) — deep Nordic forest canvases, atmospheric aurora mesh lighting, tactile frosted glassmorphism, and zero generic AI bloat.

---

## 🌟 Key Engineering Highlights

### 1. Automated Task Dependency Engine (DAG Integrity)
* **Self-Referencing Relational Model:** Tasks declare one or more prerequisite tasks (`task_dependencies` join table).
* **Automated State Locking:** When created with unmet prerequisites, tasks are automatically locked in **Blocked (🔒)** status.
* **State Transition Guard:** Attempts to transition a blocked task to `in_progress` or `completed` are intercepted by the backend with an explicit `409 Conflict` enumerating the exact blocking tasks.
* **Cascade Unblocking:** Marking an upstream prerequisite as `completed` automatically propagates down the dependency tree, unblocking downstream tasks to `To Do` without manual intervention.
* **Cycle Prevention (Cycle-Proof DAG):** Graph cycle detection validates all dependency assignments via DFS queue traversal before write, preventing circular deadlocks ($A \rightarrow B \rightarrow A$).

### 2. Scandinavian Awwwards-Grade Design System
* **Atmospheric Nordic Palette:** Deep Boreal Forest (`#07120d`) with ambient emerald aurora gradients in dark mode, and warm Nordic Oat/Sand (`#f9f8f4`) in light mode.
* **Lighthouse Status Beacon:** Real-time pulse beacon visualizing workspace operational state.
* **Precision Workflow Gauge:** High-accuracy segmented progress instrument calculating real-time deliverables and status counts.
* **Tactile Glass Cards:** Frosted glassmorphism (`backdrop-filter: blur(18px)`), micro-beveled borders, and sub-150ms elevation transitions.
* **Editorial Typography:** High-contrast geometric headings using **Plus Jakarta Sans** and **Syne**, with **JetBrains Mono** for tabular task IDs and progress metrics.

---

## 🏗️ Architecture & Database Schema

```
┌──────────────┐          ┌──────────────────────┐          ┌──────────────┐
│   projects   │ 1 ─── N  │        tasks         │  N ─── 1 │  categories  │
├──────────────┤          ├──────────────────────┤          ├──────────────┤
│ id (PK)      │          │ id (PK)              │          │ id (PK)      │
│ name         │          │ project_id (FK)      │          │ name         │
│ description  │          │ title                │          │ color        │
│ color        │          │ description          │          └──────────────┘
│ created_at   │          │ status (enum)        │
└──────────────┘          │ priority (enum)      │
                          │ category_id (FK)     │
                          │ due_date             │
                          │ created_at           │
                          │ updated_at           │
                          └──────────┬───────────┘
                                     │
                                     │ 1 (blocked task)
                          ┌──────────┴───────────┐
                          │  task_dependencies   │
                          ├──────────────────────┤
                          │ task_id (FK)         │
                          │ depends_on_task_id(FK│
                          │ created_at           │
                          └──────────────────────┘
```

* **Storage Engine:** Built-in Node.js `node:sqlite` (`DatabaseSync`), eliminating third-party C++ binary dependencies and reducing attack surfaces.
* **Concurrency:** `PRAGMA journal_mode = WAL` (Write-Ahead Logging) enables non-blocking concurrent reads alongside atomic writes.
* **Integrity:** `PRAGMA foreign_keys = ON` with `ON DELETE CASCADE` ensures clean referential consistency.

---

## 📂 Project Structure

```
internship-proj/
├── public/                       # Frontend SPA assets
│   ├── css/
│   │   └── style.css             # Miljøfyrtårn Scandinavian design system
│   ├── js/
│   │   ├── api.js                # Clean REST API client wrapper
│   │   └── app.js                # State store, DOM controller & dependency sync
│   └── index.html                # Semantic HTML5 single-page application
├── src/                          # Backend source code
│   ├── routes/
│   │   ├── categories.js         # Category CRUD endpoints
│   │   ├── projects.js           # Project management & progress metrics
│   │   └── tasks.js              # Tasks & dependency resolution logic
│   └── db.js                     # SQLite schema, indices & status sync helpers
├── data/                         # SQLite database storage (gitignored)
├── generate_docx.js              # Academic project report generator
├── package.json                  # Dependencies and scripts
├── server.js                     # Express 5 application bootstrap
└── README.md                     # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v20.0.0 or higher (v22+ recommended for native `node:sqlite`)
* **npm**: v10.0.0 or higher

### Installation & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   *For auto-restart on code changes:*
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List projects with calculated workflow completion metrics |
| `POST` | `/api/projects` | Create a new project (`name`, `description`, `color`) |
| `DELETE` | `/api/projects/:id` | Delete project and safely re-evaluate orphaned dependencies |
| `GET` | `/api/tasks` | Get tasks with filters (`project_id`, `status`, `category_id`, `priority`, `search`, `sort`) |
| `POST` | `/api/tasks` | Create task with project assignment and optional `depends_on_ids` |
| `GET` | `/api/tasks/:id` | Fetch task details with dependency tree & unmet prerequisites |
| `PATCH` | `/api/tasks/:id/status` | Update task status with transactional dependency guard |
| `PATCH` | `/api/tasks/:id` | Full update (title, description, priority, category, dependencies) |
| `DELETE` | `/api/tasks/:id` | Delete task and cascade unblock dependent tasks |
| `GET` | `/api/categories` | List all categories with active task distribution counts |
| `POST` | `/api/categories` | Create custom category tag |
| `DELETE` | `/api/categories/:id` | Delete category and detach associated tasks |
| `GET` | `/api/stats` | Global workspace summary and completion rate |

---

## 🎓 Viva & Academic Defense Talking Points

* **Why SQLite over NoSQL (MongoDB)?**  
  Task dependencies represent a Directed Acyclic Graph (DAG) with strict referential constraints. SQLite guarantees atomic multi-table updates, foreign key enforcement, and eliminates orphaned dependency states.
* **How are deadlocks prevented?**  
  A Depth-First Search (DFS) queue traversal checks proposed dependencies for cycles before saving to the database. Circular definitions are immediately rejected with a `400 Bad Request`.
* **Why `node:sqlite`?**  
  Eliminates fragile native compilation bindings (`node-gyp`), decreases Docker image footprint, and delivers deterministic zero-overhead synchronous execution.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
