# A PROJECT REPORT
ON
## TASK MANAGER WEB APPLICATION
### (Full-Stack Task Management System)

*Submitted in partial fulfillment of the requirements for the award of the degree of*

**BACHELOR OF ENGINEERING**  
IN  
**INFORMATION TECHNOLOGY**  
*(3rd Semester, R22A Regulation)*

---

### Submitted By:
**RONAK SARDA**  
**Department of Information Technology**

### Under the Esteemed Guidance of:
**Faculty Guide / Internship Coordinator**  
Department of Information Technology

---

<br>

![CBIT Logo Placeholder](https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Chaitanya_Bharathi_Institute_of_Technology_logo.png/220px-Chaitanya_Bharathi_Institute_of_Technology_logo.png)

### DEPARTMENT OF INFORMATION TECHNOLOGY
### CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY (A)
*(Affiliated to Osmania University, Approved by AICTE, Accredited by NBA & NAAC with A++ Grade)*  
**Gandipet, Hyderabad, Telangana – 500075**  
**Academic Year: 2026–2027**

\newpage

---

## CERTIFICATE

This is to certify that the Internship-1 Project Report entitled **"TASK MANAGER WEB APPLICATION"** is a bona fide record of work carried out by **RONAK SARDA** in partial fulfillment for the award of the Degree of **Bachelor of Engineering in Information Technology (3rd Semester, R22A Regulation)** from **Chaitanya Bharathi Institute of Technology (Autonomous)**, Hyderabad, affiliated to Osmania University, during the academic year 2026–2027.

The project embodies original work conducted under supervision, meets academic standards, and adheres to institutional regulations.

<br><br><br>

------------------------------------ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ------------------------------------  
**Internal Guide** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of the Department**  
Department of Information Technology &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Department of Information Technology  
CBIT (A), Hyderabad &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CBIT (A), Hyderabad  

<br><br>

------------------------------------  
**External Examiner**

\newpage

---

## DECLARATION

I, **Ronak Sarda**, hereby declare that the project report entitled **"TASK MANAGER WEB APPLICATION"**, submitted to the Department of Information Technology, Chaitanya Bharathi Institute of Technology (A), Hyderabad, for the fulfillment of the requirements of the 3rd Semester Internship-1 curriculum under the R22A regulation, is a record of independent and original work carried out by me.

I further declare that this report has not previously formed the basis for the award of any Degree, Diploma, Associateship, Fellowship, or other similar title to any candidate of any University or Institution.

<br><br><br>

**Date:** 30-10-2026 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Ronak Sarda**  
**Place:** Hyderabad &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Department of Information Technology  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chaitanya Bharathi Institute of Technology (A)

\newpage

---

## ACKNOWLEDGEMENT

I express my deepest gratitude to the Management of **Chaitanya Bharathi Institute of Technology (Autonomous)** and our Principal for providing the infrastructure, computing facilities, and conducive academic atmosphere that facilitated the completion of this Internship-1 project.

I extend my heartfelt gratitude to the **Head of the Department**, Department of Information Technology, for continuous encouragement, institutional leadership, and support throughout the semester.

I am profoundly indebted to my **Internal Faculty Guide** for invaluable guidance, patient mentoring, constructive technical critique, and consistent encouragement during every phase of this project. Their insights into full-stack software architecture, asynchronous protocols, and API design principles were instrumental in shaping this application.

Finally, I would like to thank the faculty members, technical laboratory staff of the IT department, my peers, and my family for their continuous moral support and cooperation during the tenure of this internship.

<br><br>

**Ronak Sarda**  
B.E. Information Technology (3rd Semester)  
Chaitanya Bharathi Institute of Technology (A)

\newpage

---

## ABSTRACT

The proliferation of digital workspaces necessitates streamlined, lightweight task management tools that deliver rapid responsiveness without the overhead of resource-heavy client-side frameworks. This project presents the design and implementation of a full-stack **Task Manager Web Application**, engineered to establish robust client-server interaction through standard, dependency-minimized web technologies. The backend tier is constructed using Node.js and Express.js, exposing a RESTful Application Programming Interface (API) responsible for servicing state transitions, CRUD operations, and structured JSON payloads. The persistence and storage tier abstracts structured entity lifecycles, enabling deterministic data updates. The presentation tier is developed exclusively using semantic HTML5, Vanilla CSS3, and standard ECMAScript (Vanilla JavaScript), consciously bypassing heavy front-end libraries to eliminate compilation latency and ensure zero runtime bloat. Client-server synchronization is realized asynchronously utilizing the native Fetch API, implementing dynamic Document Object Model (DOM) mutation, event delegation, and real-time state reflection without full-page reloads. The application demonstrates core competencies in modular backend routing, CORS handling, asynchronous JavaScript execution, semantic frontend structuring, and responsive user-interface design, satisfying all functional and academic criteria outlined in the 3rd Semester R22A curriculum for undergraduate studies in Information Technology.

\newpage

---

## TABLE OF CONTENTS

| Chapter No. | Title | Page No. |
| :---: | :--- | :---: |
| | **Certificate** | ii |
| | **Declaration** | iii |
| | **Acknowledgement** | iv |
| | **Abstract** | v |
| | **List of Figures and Tables** | vii |
| **1** | **Introduction** | **1** |
| | 1.1 Background and Motivation | 1 |
| | 1.2 Problem Statement | 2 |
| | 1.3 Project Objectives | 2 |
| | 1.4 Scope and Applicability | 3 |
| **2** | **System Requirements & Technology Stack** | **4** |
| | 2.1 Hardware Requirements | 4 |
| | 2.2 Software Requirements | 4 |
| | 2.3 Technology Stack Justification | 5 |
| | &nbsp;&nbsp;&nbsp;&nbsp;2.3.1 Node.js and Express.js (Backend Runtime & Server) | 5 |
| | &nbsp;&nbsp;&nbsp;&nbsp;2.3.2 HTML5 and Vanilla CSS3 (Presentation Layer) | 6 |
| | &nbsp;&nbsp;&nbsp;&nbsp;2.3.3 Vanilla JavaScript and Fetch API (Client Logic) | 7 |
| **3** | **System Design & Architecture** | **8** |
| | 3.1 Client-Server Tier Architecture | 8 |
| | 3.2 RESTful API Design and Endpoint Specification | 9 |
| | 3.3 End-to-End Data Flow | 10 |
| | 3.4 Data Integrity & State Management | 11 |
| **4** | **Implementation & Source Code Structure** | **12** |
| | 4.1 Directory and File Structure | 12 |
| | 4.2 Backend Implementation Details | 13 |
| | &nbsp;&nbsp;&nbsp;&nbsp;4.2.1 Server Initialization and Middleware Setup | 13 |
| | &nbsp;&nbsp;&nbsp;&nbsp;4.2.2 REST Route Handlers and Controller Logic | 14 |
| | 4.3 Frontend Implementation Details | 16 |
| | &nbsp;&nbsp;&nbsp;&nbsp;4.3.1 Semantic DOM Assembly | 16 |
| | &nbsp;&nbsp;&nbsp;&nbsp;4.3.2 Asynchronous Fetch Wrapper (`api.js`) | 17 |
| | &nbsp;&nbsp;&nbsp;&nbsp;4.3.3 Event Delegation and Reactive State Sync (`app.js`) | 18 |
| **5** | **Testing and Results** | **20** |
| | 5.1 Test Methodology | 20 |
| | 5.2 API Verification and Functional Test Cases | 20 |
| | 5.3 User Interface Execution and Interaction Workflow | 22 |
| **6** | **Conclusion and Future Scope** | **24** |
| | 6.1 Academic and Technical Learning Outcomes | 24 |
| | 6.2 Future Enhancements | 25 |
| | **References** | **26** |

\newpage

---

## LIST OF FIGURES AND TABLES

### List of Figures
- **Figure 3.1:** Two-Tier Client-Server Architectural Model
- **Figure 3.2:** End-to-End Asynchronous HTTP Request-Response Lifecycle
- **Figure 4.1:** Modular Project Directory Layout
- **Figure 5.1:** Task Creation and Status Pipeline Workflow

### List of Tables
- **Table 2.1:** Minimum Hardware Specifications
- **Table 2.2:** Software Environment Specifications
- **Table 3.1:** REST API Endpoint Mapping and HTTP Methods
- **Table 5.1:** Functional Test Suite and Endpoint Validation Results

\newpage

---

# CHAPTER 1: INTRODUCTION

## 1.1 Background and Motivation
In contemporary computing environments, personal and team task management systems represent one of the most fundamental classes of productivity software. While modern commercial solutions such as Jira, Asana, and Linear provide exhaustive enterprise functionality, they frequently impose substantial computational overhead, intricate dependencies, and steep learning curves. For individual developers, academic practitioners, and focused project units, there exists a persistent demand for lightweight, deterministic, and highly responsive task management systems.

From an academic perspective within the undergraduate Information Technology curriculum (R22A regulation), developing a task management system serves as an exemplary pedagogical vehicle. It synthesizes foundational principles across the software engineering spectrum:
1. **Networked Communication:** Understanding stateless HTTP communication over TCP/IP.
2. **Server-Side Computing:** Managing asynchronous event loops, request parsing, and routing.
3. **Data Representation:** Handling serialized JavaScript Object Notation (JSON) payloads.
4. **Client-Side Rendering:** Manipulating the Document Object Model (DOM) dynamically in response to asynchronous network events.

By consciously avoiding high-abstraction client-side meta-frameworks, this project emphasizes mastery over core web standards, illuminating the exact mechanics of browser-to-server data transmission.

## 1.2 Problem Statement
Many contemporary introductory full-stack applications suffer from excessive dependency chains, bloated client runtimes, and opaque build pipelines (e.g., Webpack, Babel, complex bundlers) that obscure the foundational mechanics of web engineering. Furthermore, generic "To-Do" tutorials often demonstrate simplistic client-only state storage (such as `localStorage`), failing to teach true client-server separation, RESTful conventions, status transitions, or server-side data validation. 

The objective of this project is to resolve these educational and technical shortcomings by engineering a clean, production-grade, zero-bloat full-stack Task Management System that strictly enforces architectural separation of concerns between client and server using native protocols.

## 1.3 Project Objectives
The principal objectives of this Internship-1 project are formulated as follows:
- **Design and Deploy a Node.js/Express Backend:** Construct an asynchronous, non-blocking HTTP server capable of parsing incoming requests, managing application state, and serving static resources.
- **Formulate a RESTful API:** Establish clear, resource-oriented REST endpoints conforming to standard HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) for complete task lifecycle management.
- **Implement a Zero-Bloat Presentation Tier:** Build a modern, accessible user interface using semantic HTML5 and Vanilla CSS3 without relying on third-party CSS utility frameworks or client runtime libraries.
- **Establish Asynchronous Client-Server Synchronization:** Utilize modern JavaScript ES6+ features (`async/await`, Promises, Fetch API) to query the backend dynamically, update DOM nodes in real time, and handle network anomalies gracefully without full-page reloads.
- **Incorporate Production-Grade Workflow Logic:** Implement status progression (`To Do`, `In Progress`, `Blocked`, `Completed`) and structured validation to mirror real-world software project tracking tools.

## 1.4 Scope and Applicability
The developed Task Manager is designed for local deployment and lightweight team or individual task tracking. It functions as an extensible reference architecture for full-stack client-server interaction. The project encompasses server routing, parameter validation, JSON serialization/deserialization, event-driven client updates, responsive design tokens, and modular code organization. While initially configured for single-tenant operations, the modular interface is architected to integrate seamlessly with persistent database engines (e.g., SQLite, PostgreSQL) and multi-user authentication mechanisms in future revisions.

\newpage

---

# CHAPTER 2: SYSTEM REQUIREMENTS & TECHNOLOGY STACK

## 2.1 Hardware Requirements
The development and host environment requires modest computational specifications due to the lightweight, non-blocking characteristics of the Node.js runtime and native web APIs.

**Table 2.1: Minimum Hardware Specifications**
| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Processor** | Intel Core i3 / AMD Ryzen 3 (Dual Core, 2.0 GHz) | Intel Core i5 / AMD Ryzen 5 or higher |
| **Primary Memory (RAM)** | 4 GB DDR3/DDR4 | 8 GB DDR4 or higher |
| **Secondary Storage** | 200 MB free hard disk space | Solid State Drive (SSD) with 1 GB free |
| **Input Devices** | Standard Keyboard, Mouse / Touchpad | Standard Keyboard, Mouse |
| **Display Resolution** | 1024 × 768 pixels | 1920 × 1080 pixels (Full HD) |

## 2.2 Software Requirements
The project relies on standardized, cross-platform open-source tooling, eliminating proprietary runtime dependencies.

**Table 2.2: Software Environment Specifications**
| Software Layer | Component / Tool | Version Utilized |
| :--- | :--- | :--- |
| **Operating System** | Windows / Linux / macOS | Windows 11 64-bit / Ubuntu 22.04 LTS |
| **Runtime Environment** | Node.js | v20.x or higher (LTS release) |
| **Package Manager** | Node Package Manager (npm) | v10.x / v12.x |
| **Backend Framework** | Express.js | v5.x |
| **Web Browser** | Google Chrome / Mozilla Firefox / Microsoft Edge | Chromium v118+ / Firefox v115+ |
| **Development Environment** | Visual Studio Code / Modern IDE | Latest Stable Release |

## 2.3 Technology Stack Justification

### 2.3.1 Node.js and Express.js (Backend Runtime & Server)
- **Asynchronous, Non-Blocking Event-Driven Model:** Node.js executes on Google Chrome's V8 JavaScript engine. Its single-threaded, event-loop-driven concurrency model facilitates high I/O throughput without thread context-switching overhead. This architecture is optimal for handling concurrent HTTP requests and JSON data streaming.
- **Express.js Framework:** Express is selected as the server framework due to its minimalist, unopinionated structure. It introduces negligible overhead while providing foundational abstractions for:
  - Routing tables mapping HTTP verbs and URL paths to callback controllers.
  - Middleware chaining for JSON body parsing (`express.json()`), Cross-Origin Resource Sharing (`cors()`), and static asset delivery (`express.static()`).
  - Standardized request and response pipeline handling.

### 2.3.2 HTML5 and Vanilla CSS3 (Presentation Layer)
- **Semantic Markup:** HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<article>`, `<dialog>`) ensure accessibility, semantic clarity, and clean DOM trees without superfluous container abstractions (`<div>` proliferation).
- **Zero-Dependency Styling:** Rather than using utility-first frameworks like Tailwind CSS or heavy CSS preprocessors, the application uses modern Vanilla CSS3:
  - **CSS Custom Properties (Variables):** Standardizes design tokens (color palettes, spacing, typography scales, surface elevations) and allows instant runtime switching between light and dark themes.
  - **CSS Flexbox & CSS Grid:** Guarantees fully responsive, fluid layouts across mobile, tablet, and desktop viewports without external grid libraries.
  - **Restrained Aesthetics:** Employs crisp 1-pixel borders, controlled contrast ratios, and subtle micro-transitions to deliver a deliberate, professional product interface modeled after modern developer tools.

### 2.3.3 Vanilla JavaScript and Fetch API (Client Logic)
- **Elimination of Framework Bloat:** By eschewing client-side meta-frameworks (e.g., React, Angular, Vue), the application avoids heavy bundle sizes (often exceeding hundreds of kilobytes for basic tasks), Virtual DOM reconciliation overhead, and build-time bundling toolchains.
- **Native Fetch API:** Facilitates asynchronous, Promise-based network communication directly supported by modern browser engines, streamlining serialized JSON data transmission.
- **Direct DOM Manipulation & Event Delegation:** Attaching consolidated listeners to parent containers enhances memory efficiency and guarantees predictable UI rendering directly synchronized with server responses.

\newpage

---

# CHAPTER 3: SYSTEM DESIGN & ARCHITECTURE

## 3.1 Client-Server Tier Architecture
The system is architected around a classical two-tier **Client-Server Architecture**, adhering strictly to the **Separation of Concerns (SoC)** principle.

```
+-------------------------------------------------------------+
|                        CLIENT TIER                          |
|  (Web Browser: HTML5, Vanilla CSS3, Vanilla JavaScript)     |
|                                                             |
|   +-------------------+              +------------------+   |
|   |  DOM / UI View    | <----------> |  Event Handlers  |   |
|   +-------------------+              +------------------+   |
|                                                |            |
|                                                v            |
|                                      +------------------+   |
|                                      |  Fetch API Client|   |
|                                      +------------------+   |
+------------------------------------------------|------------+
                                                 |
                       HTTP / JSON (REST API)    |
                                                 v
+-------------------------------------------------------------+
|                        SERVER TIER                          |
|               (Node.js Runtime / Express.js)                |
|                                                             |
|   +-------------------+              +------------------+   |
|   | Static Asset Svc  |              | Express Router   |   |
|   +-------------------+              +------------------+   |
|                                                |            |
|                                                v            |
|                                      +------------------+   |
|                                      | Controller Logic |   |
|                                      | & Data Validation|   |
|                                      +------------------+   |
|                                                |            |
|                                                v            |
|                                      +------------------+   |
|                                      | Storage Service  |   |
|                                      +------------------+   |
+-------------------------------------------------------------+
```
*Figure 3.1: Two-Tier Client-Server Architectural Model*

1. **Client Tier (Presentation & User Interaction):** Operates within the browser runtime. It captures user inputs, validates fields locally, formats JSON payloads, executes asynchronous HTTP requests, and repaints the DOM upon receiving verified responses.
2. **Server Tier (Application Logic & Storage abstraction):** Operates within the Node.js runtime environment. It intercepts incoming HTTP traffic, routes endpoints, enforces structural data validation, executes business rules, modifies state, and issues standardized JSON status codes and payloads.

## 3.2 RESTful API Design and Endpoint Specification
The server exposes a stateless, resource-oriented REST interface. Operations map predictably to standard HTTP verbs.

**Table 3.1: REST API Endpoint Mapping and HTTP Methods**
| HTTP Method | Route Endpoint | Purpose / Functionality | Success Status | Payload / Parameters |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/tasks` | Retrieve tasks with optional query filters | `200 OK` | Query: `status`, `project_id`, `search`, `sort` |
| `POST` | `/api/tasks` | Create a new task entry | `201 Created` | Body: `{ title, project_id, priority, ... }` |
| `GET` | `/api/tasks/:id` | Retrieve detailed metadata for a single task | `200 OK` | URL Param: `id` (integer) |
| `PATCH` | `/api/tasks/:id/status`| Transition a task's workflow status | `200 OK` | Body: `{ status: 'completed' \| ... }` |
| `PATCH` | `/api/tasks/:id` | Update specified task attributes | `200 OK` | Body: JSON object of modified fields |
| `DELETE` | `/api/tasks/:id` | Permanently remove a task entry | `200 OK` | URL Param: `id` (integer) |
| `GET` | `/api/projects` | Fetch all project groups with progress metrics | `200 OK` | None |
| `GET` | `/api/stats` | Retrieve global aggregated workspace metrics | `200 OK` | None |

## 3.3 End-to-End Data Flow
The operational lifecycle of a client-initiated transaction proceeds through six deterministic stages:

```
[User Action] (e.g., Click "Add Task")
      |
      v
[Client Validation] -> Verify non-empty title string
      |
      v
[Asynchronous Dispatch] -> Fetch API sends HTTP POST /api/tasks (JSON body)
      |
      v
[Server Ingestion] -> Express middleware parses body via express.json()
      |
      v
[Route Processing] -> Route handler validates payload and executes storage mutation
      |
      v
[HTTP Response] -> Server issues HTTP 201 Created with new task JSON object
      |
      v
[Reactive DOM Mutation] -> Client JavaScript receives Promise, prepends row to DOM,
                           and triggers status counter recalibration
```
*Figure 3.2: End-to-End Asynchronous HTTP Request-Response Lifecycle*

## 3.4 Data Integrity & State Management
The system enforces strict data validation on both client and server boundaries:
- **String Sanitization:** Title inputs undergo strict whitespace trimming and character length constraints ($1 \le \text{length} \le 200$).
- **Enumeration Constraints:** Workflow statuses are restricted to defined states: `'todo'`, `'in_progress'`, `'blocked'`, and `'completed'`.
- **Relational Integrity:** Tasks map directly to valid project identifiers, ensuring tasks are never orphaned.
- **Idempotent Operations:** Resource deletion and retrieval operations maintain idempotency, returning standardized error codes (`400 Bad Request`, `404 Not Found`, or `409 Conflict`) when invalid operations are requested.

\newpage

---

# CHAPTER 4: IMPLEMENTATION & SOURCE CODE STRUCTURE

## 4.1 Directory and File Structure
The project adopts a modular directory structure separating backend server modules from public static client assets.

```
internship-proj/
│
├── package.json                 # Dependency manifests, metadata, and scripts
├── server.js                    # Main server entrypoint, middleware, and route mounting
│
├── src/                         # Server-side source modules
│   ├── db.js                    # Database connection, schemas, and relational constraints
│   └── routes/                  # Express sub-routers
│       ├── tasks.js             # REST route handlers for task lifecycle management
│       ├── projects.js          # REST route handlers for project workflow aggregation
│       └── categories.js        # REST route handlers for category tags and counters
│
├── public/                      # Static client assets (served by Express)
│   ├── index.html               # Semantic single-page HTML interface
│   ├── css/
│   │   └── style.css            # Custom CSS design system, layout grid, and themes
│   └── js/
│       ├── api.js               # Asynchronous Fetch API abstraction wrapper
│       └── app.js               # Frontend controller, state store, and DOM renderer
│
└── data/                        # Persistent local database storage directory
    └── tasks.db                 # SQLite database storage file
```
*Figure 4.1: Modular Project Directory Layout*

## 4.2 Backend Implementation Details

### 4.2.1 Server Initialization and Middleware Setup (`server.js`)
The application entrypoint initializes an Express server instance, registers critical middleware, mounts API routing pipelines, and serves public static resources.

```javascript
// Excerpt from server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const tasksRouter = require('./src/routes/tasks');
const projectsRouter = require('./src/routes/projects');
const categoriesRouter = require('./src/routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Universal Middleware Pipeline
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Resource API Sub-Router Mounting
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter);

// Single Page Application Fallback Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Initialization
app.listen(PORT, () => {
  console.log(`TaskMaster Server running at: http://localhost:${PORT}`);
});
```

### 4.2.2 REST Route Handlers and Controller Logic (`src/routes/tasks.js`)
Task routes implement input validation, status queries, and transactional updates. The controller handles `GET`, `POST`, `PATCH`, and `DELETE` requests with descriptive error logging and accurate HTTP response codes.

```javascript
// Excerpt from src/routes/tasks.js: Task Creation Handler
router.post('/', (req, res) => {
  try {
    let { project_id, title, description, priority, category_id, due_date, status } = req.body;

    // Field Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }
    title = title.trim();

    // Insertion Statement Execution
    const insertStmt = db.prepare(`
      INSERT INTO tasks (project_id, title, description, status, priority, category_id, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    const result = insertStmt.run(project_id, title, description, status || 'todo', priority || 'Medium', category_id, due_date);
    const createdTask = getTaskDetails(Number(result.lastInsertRowid));

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    console.error('Task creation failure:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
```

## 4.3 Frontend Implementation Details

### 4.3.1 Semantic DOM Assembly (`public/index.html`)
The user interface is declared using semantic tags that establish visual and accessible hierarchy:
- `<header class="app-topbar">`: Houses the application branding, project statistics pill, theme toggle, and trigger action buttons.
- `<section class="project-header-panel">`: Houses project navigation tabs and active progress bar metrics.
- `<div class="status-filter-group">`: Formulates workflow filter buttons (`All`, `To Do`, `In Progress`, `Blocked`, `Completed`).
- `<div id="taskList">`: Serves as the dynamic mount target for rendering server-persisted task rows.

### 4.3.2 Asynchronous Fetch Wrapper (`public/js/api.js`)
To decouple network transport logic from UI presentation, all network transactions are centralized in an asynchronous `API` client object.

```javascript
// Excerpt from public/js/api.js: Centralized Request Method
const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.error || `HTTP error ${response.status}`);
        error.data = data;
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Network request failed on [${options.method || 'GET'} ${url}]:`, error);
      throw error;
    }
  },

  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? '?' + query : ''}`);
  },

  async createTask(taskData) {
    return this.request('/tasks', { method: 'POST', body: JSON.stringify(taskData) });
  },

  async updateTaskStatus(id, status) {
    return this.request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }
};
```

### 4.3.3 Event Delegation and Reactive State Sync (`public/js/app.js`)
The application implements an in-memory client state store (`state = { tasks: [], projects: [], filters: {} }`). DOM mutation is managed via event delegation on parent containers rather than attaching discrete listeners to individual rows:

```javascript
// Excerpt from public/js/app.js: Event Delegation for Workflow Transitions
el.taskList.addEventListener('click', async (e) => {
  const row = e.target.closest('.task-row');
  if (!row) return;

  const taskId = parseInt(row.dataset.id, 10);
  const cycleBtn = e.target.closest('[data-action="cycle-status"]');

  if (cycleBtn) {
    const task = state.tasks.find(t => t.id === taskId);
    let nextStatus = 'in_progress';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'completed';
    else if (task.status === 'completed') nextStatus = 'todo';

    try {
      const res = await API.updateTaskStatus(taskId, nextStatus);
      if (res.success) {
        showToast(`Task #${taskId} updated to ${res.data.status}`, 'success');
        await loadAllData(); // Synchronize local state with backend
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  }
});
```

\newpage

---

# CHAPTER 5: TESTING AND RESULTS

## 5.1 Test Methodology
Testing of the Task Manager Web Application was performed across multiple software quality dimensions:
1. **API Functional Testing:** Validating endpoint status codes, header configurations, and payload contracts using programmatic HTTP fetch test scripts.
2. **Boundary and Validation Testing:** Passing malformed inputs, empty string payloads, and invalid foreign keys to ensure server-side guards fail safely.
3. **Cross-Browser and Responsive Testing:** Verifying styling integrity and layout responsiveness across Chromium and Gecko browser engines across mobile and desktop breakpoints.

## 5.2 API Verification and Functional Test Cases

**Table 5.1: Functional Test Suite and Endpoint Validation Results**
| Test ID | Test Scenario | HTTP Method & Route | Input Payload | Expected Response | Observed Result | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Retrieve all tasks | `GET /api/tasks` | None | `HTTP 200 OK`, JSON array | Received tasks array | **Pass** |
| **TC-02** | Add valid task | `POST /api/tasks` | `{"title":"Setup DB","project_id":1}` | `HTTP 201 Created`, created object | Task inserted, ID returned | **Pass** |
| **TC-03** | Add task with empty title | `POST /api/tasks` | `{"title":""}` | `HTTP 400 Bad Request`, error msg | Correctly rejected | **Pass** |
| **TC-04** | Valid status change | `PATCH /api/tasks/1/status` | `{"status":"completed"}` | `HTTP 200 OK`, status updated | Status shifted to 'completed' | **Pass** |
| **TC-05** | Invalid status transition | `PATCH /api/tasks/1/status` | `{"status":"invalid_state"}` | `HTTP 400 Bad Request` | Rejected with validation message | **Pass** |
| **TC-06** | Delete existing task | `DELETE /api/tasks/1` | None | `HTTP 200 OK`, confirmation | Task removed from storage | **Pass** |
| **TC-07** | Delete non-existent task | `DELETE /api/tasks/999` | None | `HTTP 404 Not Found` | Handled with 404 error | **Pass** |
| **TC-08** | Project metrics computation| `GET /api/projects` | None | `HTTP 200 OK`, calculated metrics | Percentages accurately derived | **Pass** |

## 5.3 User Interface Execution and Interaction Workflow
The execution of the user interface demonstrates clean visual hierarchy and immediate user feedback:
1. **Initial Load & Global Summary:** Upon accessing `http://localhost:3000`, the application executes parallel `Promise.all()` calls fetching projects, categories, and tasks. The top navigation updates the global status summary pill (`X/Y completed`).
2. **Project Context Switching:** Selecting a project tab filters the workspace immediately. The progress bar recalibrates, displaying visual ratios for completed, in-progress, blocked, and to-do segments.
3. **Task Manipulation:**
   - Clicking **"New Task"** launches a focused modal dialog. Upon form submission, the modal automatically closes, a confirmation toast notification slides into the viewport, and the new task appears at the top of the list without a page refresh.
   - Clicking the status badge advances the task state through the workflow pipeline, recalculating progress percentages instantly.
   - Clicking the delete icon triggers a confirmation prompt; upon user validation, the record is unmounted from the DOM and purged from the server tier.

\newpage

---

# CHAPTER 6: CONCLUSION AND FUTURE SCOPE

## 6.1 Academic and Technical Learning Outcomes
The engineering of the **Task Manager Web Application** fulfilled all core learning objectives specified in the 3rd Semester Information Technology Internship-1 curriculum (R22A Regulation) at Chaitanya Bharathi Institute of Technology. 

Key technical and academic outcomes achieved through this project include:
- **Comprehensive Full-Stack Fluency:** Acquired practical proficiency in managing asynchronous client-server communication using HTTP protocols, REST architectural paradigms, and structured JSON serialization.
- **Mastery of Non-Blocking Architecture:** Understood the mechanics of Node.js event-driven processing, Express middleware chaining, and modular route structuring.
- **Standards-Compliant UI Engineering:** Developed an appreciation for Vanilla CSS3 design systems, responsive layout structures, and accessibility standards without relying on bloated third-party frameworks.
- **Defensive Programming & Validation:** Cultivated rigorous engineering practices regarding client- and server-side data sanitization, HTTP response code semantics, and error boundaries.

## 6.2 Future Enhancements
While the current system satisfies all immediate academic and operational goals, several promising avenues exist for future technical extension:
1. **User Authentication and Authorization:** Implement token-based authentication (JSON Web Tokens - JWT) and password hashing via `bcrypt` to support secure multi-tenant user accounts and role-based access control (RBAC).
2. **Real-Time Bidirectional Synchronization:** Integrate WebSocket protocols (e.g., `Socket.io`) to enable real-time collaboration, broadcasting task updates to multiple concurrent clients without polling.
3. **Cloud Native Containerization & CI/CD:** Package the full-stack application into a Docker container and configure a continuous integration and continuous deployment (CI/CD) pipeline for automated deployment on cloud platforms such as AWS ECS or Google Cloud Run.
4. **Offline PWA Capabilities:** Implement Service Workers and Cache Storage APIs to transform the web app into a Progressive Web App (PWA) capable of offline queuing and synchronization.

\newpage

---

# REFERENCES

1. **Flanagan, D. (2020).** *JavaScript: The Definitive Guide: Master the World's Most-Used Programming Language* (7th ed.). O'Reilly Media.
2. **Haverbeke, M. (2018).** *Eloquent JavaScript: A Modern Introduction to Programming* (3rd ed.). No Starch Press.
3. **Casciaro, M., & Mammino, L. (2020).** *Node.js Design Patterns: Design and implement production-grade Node.js applications* (3rd ed.). Packt Publishing.
4. **Mozilla Developer Network (MDN) Web Docs.** *Working with the Fetch API and Asynchronous JavaScript.* Available online: https://developer.mozilla.org/
5. **Express.js Technical Documentation.** *Express 5.x API Reference and Routing Guide.* Available online: https://expressjs.com/
6. **Fielding, R. T. (2000).** *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation). University of California, Irvine.
7. **Chaitanya Bharathi Institute of Technology (A).** *Curriculum and Syllabus Book for B.E. Information Technology (R22A Regulation).* CBIT Autonomous Academic Regulations, Hyderabad.
