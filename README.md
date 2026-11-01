# ⚡ TaskFlow — Cloud-Native Task Manager

> **End-to-End DevOps Capstone Project**  
> Complete DevOps lifecycle demonstration: **Code → GitHub → Jenkins → Docker → Kubernetes → Ansible → Terraform → Monitoring → Logging → Security → Blue-Green → GitOps**

---

## 📌 Milestones Overview

| Milestone | Focus | Status |
|---|---|---|
| **Milestone 1** | Application Architecture, REST API, Auth, MongoDB & Responsive UI | ✅ Complete |
| **Milestone 1.5** | **Google Gemini AI Integration** (Smart NLP Add, Breakdown & Daily Briefing) | ✅ Complete |
| **Milestone 2** | **Production Containerization** (Multi-Stage Dockerfile & Docker Compose) | ✅ Complete |
| **Milestone 3** | **Automated CI/CD Pipeline** (Jenkinsfile & GitHub Actions Workflow) | ✅ Complete |
| **Milestone 4** | **Kubernetes Orchestration & Cluster Deployment** (Manifests, HPA, Ingress) | ✅ Complete |
| **Milestone 5** | **Infrastructure as Code (Terraform) & Configuration (Ansible)** | ✅ Complete |

---

## ✨ Gemini AI-Powered Features

TaskFlow incorporates **Google Gemini AI** to elevate task management into an intelligent, adaptive workflow:

1. **⚡ Natural Language Task Scheduler (Smart Add)**:
   - Type plain language prompts directly in the dashboard:  
     *e.g., `"Configure Docker multi-stage build by Friday high priority"`*
   - Gemini automatically parses title, priority, status, and target due date.
2. **🧩 AI Task Deconstruction & Subtasks**:
   - In the task modal, click **"✨ Gemini Breakdown"**.
   - Gemini decomposes high-level deliverables into clear checklists, suggests priority, estimates completion time, and provides pro-tips.
3. **🌅 AI Morning Standup & Focus Briefing**:
   - Click **"✨ AI Standup Brief"** for an executive daily plan.
   - Evaluates active tasks and gives a recommended focus order, energy-level rating, and engineering productivity advice.
4. **🛡️ Resilient Offline Fallback Engine**:
   - Includes heuristic fallback so AI capabilities operate gracefully offline or without an immediate API key.

---

## 🗂️ Project Directory Structure

```text
Task_manager/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile
│   │   ├── taskController.js     # Task CRUD & stats aggregation
│   │   └── aiController.js       # Gemini breakdown, parse & briefing
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification
│   │   └── errorMiddleware.js    # Global error & 404 handler
│   ├── models/
│   │   ├── User.js               # Mongoose User schema with bcrypt hooks
│   │   └── Task.js               # Mongoose Task schema with indexes
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── taskRoutes.js         # /api/tasks routes
│   │   └── aiRoutes.js           # /api/ai routes
│   ├── services/
│   │   └── geminiService.js      # Gemini GenAI client & fallback engine
│   ├── scripts/
│   │   └── seed.js               # Database seeding with realistic tasks
│   ├── tests/
│   │   ├── auth.test.js          # Authentication test suite
│   │   ├── task.test.js          # Task CRUD & health test suite
│   │   └── ai.test.js            # Gemini AI test suite
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
│   ├── dashboard.html            # AI-enabled dashboard & stats cards
│   ├── css/
│   │   └── style.css             # Glassmorphism dark-theme styling + AI badges
│   └── js/
│       ├── api.js                # Centralized API service & toast notifications
│       ├── auth.js               # Authentication controller
│       ├── dashboard.js          # Task management & Gemini AI handlers
│       └── landing.js            # Landing page interactive preview
│
├── Dockerfile                    # Production multi-stage Alpine build
├── docker-compose.yml            # Local orchestration (App + MongoDB)
├── .dockerignore                 # Minimal build context filter
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

### Gemini AI Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/breakdown` | Decompose task title into subtasks & criteria | Yes |
| `POST` | `/api/ai/parse-task` | Parse natural language sentence into task JSON | Yes |
| `GET` | `/api/ai/briefing` | Generate morning standup priorities from active tasks | Yes |

### Health Probe
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Kubernetes / Docker health check probe (`status: UP`) |

---

## 🧪 Running Automated Tests

Tests run using an isolated in-memory MongoDB server (`mongodb-memory-server`):

```bash
cd backend
npm test
```

Result:
```text
PASS tests/task.test.js
PASS tests/auth.test.js
PASS tests/ai.test.js

Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
Snapshots:   0 total
```

---

## 🐳 Running with Docker & Docker Compose (Milestone 2)

### 1. Start App and MongoDB
```bash
docker compose up -d --build
# Or via root script:
npm run docker:up
```

### 2. View Logs
```bash
docker compose logs -f
```

### 3. Stop Containers
```bash
docker compose down
# Or:
npm run docker:down
```

---

## 💻 Running Locally (Without Docker)

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Optionally add your GEMINI_API_KEY for live Google Gemini calls:
# GEMINI_API_KEY=your_key_here
```

### 3. Start MongoDB
```bash
# If MongoDB is installed locally:
mongod
# Or using Docker for MongoDB only:
docker run -d -p 27017:27017 --name mongo-local mongo:7.0
```

### 4. (Optional) Seed Sample Data
```bash
npm run seed
```

### 5. Start Application
```bash
npm start
# Or for auto-reload during development:
npm run dev
```

Visit the app:
- **Landing Page**: `http://localhost:5050`
- **Dashboard**: `http://localhost:5050/dashboard.html`
- **Health Check**: `http://localhost:5050/health`
- **Demo Account**: `ritik@taskflow.dev` / `Password123`

---

## ☸️ Deploying to Kubernetes (Milestone 4)

All Kubernetes deployment manifests are packaged declaratively inside the [`k8s/`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/) directory:

| Manifest | Purpose |
|---|---|
| [`namespace.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/namespace.yaml) | Isolates platform workloads into dedicated `taskflow` namespace. |
| [`configmap.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/configmap.yaml) | Non-sensitive runtime variables (`PORT`, `NODE_ENV=production`). |
| [`secret.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/secret.yaml) | Encrypted/sensitive credentials (`JWT_SECRET`, `MONGO_URI`, `GEMINI_API_KEY`). |
| [`mongodb-statefulset.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/mongodb-statefulset.yaml) | StatefulSet + Headless Service + PVC for in-cluster database persistence. |
| [`deployment.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/deployment.yaml) | High-availability Deployment (3 replicas, zero-downtime RollingUpdate, `/health` probes). |
| [`service.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/service.yaml) | Service routing external HTTP traffic via NodePort 30080. |
| [`ingress.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/ingress.yaml) | NGINX Ingress Controller rules for `taskflow.local` domain. |
| [`hpa.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/hpa.yaml) | Horizontal Pod Autoscaler scaling 2–10 pods based on 70% CPU / 80% Memory. |
| [`kustomization.yaml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/k8s/kustomization.yaml) | 1-command deployment overlay for the complete Kubernetes stack. |

### 1. Apply All Manifests with Kustomize
```bash
kubectl apply -k k8s/
# Or via root script:
npm run k8s:apply
```

### 2. Check Deployment & Pod Status
```bash
kubectl get all -n taskflow
# Or via root script:
npm run k8s:status
```

### 3. Verify Rolling Update Strategy
```bash
# Update container image with zero downtime:
kubectl set image deployment/taskflow-app taskflow-container=taskflow:v1.1.0 -n taskflow
# Monitor rollout status:
kubectl rollout status deployment/taskflow-app -n taskflow
# Rollback if needed:
kubectl rollout undo deployment/taskflow-app -n taskflow
```

### 4. Delete Kubernetes Stack
```bash
kubectl delete -k k8s/
# Or via root script:
npm run k8s:delete
```

---

## 🏗️ Infrastructure as Code with Terraform (Milestone 5)

All AWS cloud infrastructure is provisioned declaratively in the [`terraform/`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/) directory:

| File | Purpose |
|---|---|
| [`main.tf`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/main.tf) | Custom VPC, Internet Gateway, Public Subnet, and Route Tables. |
| [`security_groups.tf`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/security_groups.tf) | Firewall rules for SSH (22), HTTP (80/443), App (5050), NodePort (30080), Jenkins (8080/50000). |
| [`ec2.tf`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/ec2.tf) | EC2 instances for TaskFlow Kubernetes Host and dedicated Jenkins Controller with automated bootstrap scripts. |
| [`variables.tf`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/variables.tf) | Region, CIDR blocks, instance sizing, and KeyPair definitions. |
| [`outputs.tf`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/outputs.tf) | Public IPs, DNS, Web URLs, and ready-to-use SSH connection commands. |
| [`terraform.tfvars.example`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/terraform/terraform.tfvars.example) | Variable template for quick customization. |

### Provisioning Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

---

## ⚙️ Configuration Management with Ansible (Milestone 5)

Server configuration, runtime dependencies, and deployment automation are codified inside the [`ansible/`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/) directory:

| Playbook / Config | Purpose |
|---|---|
| [`ansible.cfg`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/ansible.cfg) | Sudo escalation, inventory mappings, and SSH connection parameters. |
| [`inventory.ini`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/inventory.ini) | Host groups for Kubernetes nodes (`k8s_nodes`) and Jenkins controllers (`jenkins_controllers`). |
| [`playbooks/setup_docker.yml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/playbooks/setup_docker.yml) | Installs official Docker Engine, containerd, and Docker Compose plugin. |
| [`playbooks/setup_k8s_node.yml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/playbooks/setup_k8s_node.yml) | Disables swap, configures bridge networking (`br_netfilter`), sysctl, and installs `kubectl`. |
| [`playbooks/deploy_taskflow.yml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/playbooks/deploy_taskflow.yml) | Clones codebase, launches containers, and waits for `/health` probe (HTTP 200). |
| [`playbooks/site.yml`](file:///Users/ritikbhardwaj/Downloads/CapstoneProject/Task_manager/ansible/playbooks/site.yml) | Master orchestration playbook running all playbooks sequentially. |

### Executing Ansible Playbooks
```bash
cd ansible
# 1. Update inventory.ini with your target server IP addresses:
# nano inventory.ini

# 2. Run master orchestration across all hosts:
ansible-playbook -i inventory.ini playbooks/site.yml

# Or run individual stages:
ansible-playbook -i inventory.ini playbooks/setup_docker.yml
ansible-playbook -i inventory.ini playbooks/setup_k8s_node.yml
ansible-playbook -i inventory.ini playbooks/deploy_taskflow.yml
```


