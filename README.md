# ⚡ TaskFlow — Cloud-Native Task Manager

> **End-to-End DevOps Capstone Project**  
> Complete DevOps lifecycle demonstration: **Code → GitHub → Jenkins → Docker → Kubernetes → Ansible → Terraform → Monitoring → Logging → Security → Blue-Green → GitOps**

---

## 📌 Milestone 1: Application Architecture & Delivery

TaskFlow provides a full-featured, secure, and responsive Task Management system built using the **Node.js + Express + MongoDB** stack, with responsive frontend UI and automated test suites.

### Key Capabilities
- **Authentication**: User Registration & Login with bcrypt password hashing and JSON Web Tokens (JWT).
- **Task Management (CRUD)**:
  - Create tasks with Priority (`Low`, `Medium`, `High`), Status (`Pending`, `In Progress`, `Completed`), and Due Dates.
  - Read & Filter tasks by Status, Priority, and keyword Search.
  - Update task details or toggle completion status.
  - Delete tasks with confirmation.
  - User-level data isolation (users only access their own tasks).
- **Health Check Probe**: Ready for Kubernetes liveness & readiness probes at `GET /health`.
- **Automated Tests**: Unit & Integration tests running via Jest, Supertest, and MongoMemoryServer (20 tests passed).

---

## 🗂️ Project Directory Structure

```text
Task_manager/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   └── taskController.js     # Task CRUD and stats aggregation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification
│   │   └── errorMiddleware.js    # Global error & 404 handler
│   ├── models/
│   │   ├── User.js               # Mongoose User schema with bcrypt hooks
│   │   └── Task.js               # Mongoose Task schema with indexes
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── taskRoutes.js         # /api/tasks routes
│   ├── scripts/
│   │   └── seed.js               # Database seeding with realistic tasks
│   ├── tests/
│   │   ├── auth.test.js          # Authentication test suite
│   │   └── task.test.js          # Task CRUD & health test suite
│   ├── app.js                    # Express app configuration & middleware
│   ├── server.js                 # Server entry point
│   ├── package.json              # Backend dependencies & scripts
│   ├── .env                      # Local environment variables
│   └── .env.example              # Environment template
│
├── frontend/
│   ├── index.html                # Modern landing page & DevOps showcase
│   ├── login.html                # Sign-in page with 1-click demo filler
│   ├── register.html             # User registration page
│   ├── dashboard.html            # Interactive task dashboard & stats cards
│   ├── css/
│   │   └── style.css             # Glassmorphism dark-theme styling
│   └── js/
│       ├── api.js                # Centralized API service & toast notifications
│       ├── auth.js               # Authentication controller
│       └── dashboard.js          # Task management & filter logic
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 REST API Specification

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes (Bearer Token) |

### Task Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | List tasks (supports `status`, `priority`, `search`, `sortBy`) | Yes |
| `POST` | `/api/tasks` | Create a new task | Yes |
| `GET` | `/api/tasks/stats/summary` | Get aggregated dashboard metrics | Yes |
| `GET` | `/api/tasks/:id` | Get task by ID | Yes |
| `PUT` | `/api/tasks/:id` | Update task by ID | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | Yes |

### Health Endpoint
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Kubernetes Liveness/Readiness probe (`status: UP`) |

---

## 🧪 Running Tests

Tests use an in-memory database (`mongodb-memory-server`) so they run anywhere without an external MongoDB server:

```bash
cd backend
npm test
```

Result:
```text
PASS tests/task.test.js
PASS tests/auth.test.js

Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
```

---

## 💻 Running Locally

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` if not already present:
```bash
cp .env.example .env
```

### 3. Start MongoDB
If using local MongoDB:
```bash
mongod
# Or using Docker:
docker run -d -p 27017:27017 --name mongo-local mongo:latest
```

### 4. (Optional) Seed Sample Data
```bash
npm run seed
```

### 5. Start the Application
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Visit the application in your browser:
- **Landing Page**: `http://localhost:5000`
- **Dashboard**: `http://localhost:5000/dashboard.html`
- **Health Check**: `http://localhost:5000/health`
