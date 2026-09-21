# SPRNT

SPRNT is an AI-guided focus and accountability app designed for people who thrive on structured work blocks, low friction task initiation, and regular encouraging check-ins.

---

## ⚡ Overview & Workflow

1. **Set a Sprint**: Enter your goal and choose your sprint duration (15 to 180 minutes).
2. **Break It Down**:
   - **AI Coach**: Automatically generates ADHD-friendly 15-minute focus blocks with an ultra low-friction starter step.
   - **I'll Set the Steps (Manual)**: Actively define your own step-by-step micro-wins.
3. **Focus with Timer**: Work through each block with a built-in visual timer and progress tracking.
4. **Accountability Check-in**: Submit quick reflections at each milestone to receive validating, energizing feedback.
5. **Session Completion**: Review your completed sprint summary and celebrate your executive focus.
6. **User Accounts**: Sign up / Log in to persist and isolate your sprints across devices.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.10+), SQLite, Pydantic, Google GenAI SDK
- **Database**: SQLite with modular schema migrations and token-based auth
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons

---

## 📁 Project Structure

```
SPRNT/
├── backend/
│   ├── app.py                  # FastAPI application entrypoint & middleware
│   ├── config.py               # Centralized configuration & environment loader
│   ├── models.py               # Backward-compatible shim pointing to db/
│   ├── requirements.txt        # Backend dependencies
│   ├── db/                     # Modular database layer
│   │   ├── __init__.py         # Public db exports
│   │   ├── connection.py       # SQLite connection helper
│   │   ├── schema.py           # Table initialization & migrations
│   │   ├── users.py            # User registration, auth & PBKDF2 hashing
│   │   ├── sessions.py         # Session CRUD & aggregate SQL queries
│   │   └── tasks.py            # Task tracking, check-ins & progression
│   ├── routes/                 # API route controllers
│   │   ├── auth.py             # /auth/register, /auth/login, /auth/me, /auth/logout
│   │   ├── sessions.py         # /sessions CRUD & completion endpoints
│   │   └── tasks.py            # /tasks/{id}/complete endpoint
│   └── services/               # Business logic & integrations
│       ├── ai_service.py       # Gemini API client + robust local fallback coach
│       └── task_service.py     # Sprint lifecycle orchestration
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx             # Main router & top-level layout
│       ├── components/
│       │   ├── AuthModal.jsx   # Sign in & Account creation modal
│       │   ├── Dashboard.jsx   # Sprint history & quick actions
│       │   ├── Header.jsx      # Navigation & account controls
│       │   ├── ProgressBar.jsx # Visual sprint progress indicator
│       │   ├── SessionActive.jsx # Active sprint workbench & check-in flow
│       │   ├── SessionComplete.jsx # Sprint summary & celebration
│       │   ├── SessionCreation.jsx # Goal entry, duration & step builder
│       │   └── Timer.jsx       # Sprint countdown timer
│       ├── services/
│       │   └── api.js          # Unified frontend API client & auth token storage
│       └── index.css           # Design tokens & custom styling
├── .env                        # Local environment secrets (git-ignored)
└── README.md
```

---

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
# Optional: Set your Gemini API key for live AI coaching
GEMINI_API_KEY=your_gemini_api_key_here

# Provider configuration (default: gemini, fallback: local)
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
```

> **Note**: If `GEMINI_API_KEY` is not provided or network is unreachable, SPRNT will seamlessly use its built-in rule-based coaching engine without failing.

### 2. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. You can explore interactive docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Reference

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new user account with `username` and `password` | No |
| `POST` | `/auth/login` | Authenticate and obtain a session Bearer token | No |
| `GET` | `/auth/me` | Fetch currently authenticated user profile | Yes (`Bearer <token>`) |
| `POST` | `/auth/logout` | Invalidate current session token | Yes (`Bearer <token>`) |

### Sessions (`/sessions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/sessions` | List sessions (filtered by user if authenticated) | Optional |
| `POST` | `/sessions` | Create a new session (AI or manual breakdown) | Optional |
| `GET` | `/sessions/{id}` | Get session details, tasks, and check-in timeline | Optional |
| `DELETE` | `/sessions/{id}` | Delete a sprint and its associated tasks/check-ins | Optional |
| `GET` | `/sessions/{id}/progress` | Get task completion stats for a session | Optional |
| `POST` | `/sessions/{id}/end` | Mark a session as completed | Optional |

#### Example Session Creation Payload (`POST /sessions`):

```json
{
  "title": "Build user authentication feature",
  "description": "Implement registration, login, and JWT tokens",
  "planning_mode": "ai",
  "duration_minutes": 45,
  "tasks": null
}
```

Or with manual steps (`planning_mode: "manual"`):

```json
{
  "title": "Write quarterly report",
  "planning_mode": "manual",
  "duration_minutes": 30,
  "tasks": [
    "Gather raw metrics from dashboard",
    "Draft executive summary"
  ]
}
```

### Tasks (`/tasks`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/tasks/{task_id}/complete` | Complete a focus block, log reflection, and receive AI coaching check-in | Optional |

#### Example Task Completion Payload (`POST /tasks/{task_id}/complete`):

```json
{
  "user_response": "Finished drafting the outline and gathered all data points."
}
```

---

## 🛡️ Error Handling & Status Codes

- `200 OK` / `201 Created`: Request succeeded.
- `400 Bad Request`: Validation error or invalid parameters (e.g. missing title, username taken).
- `401 Unauthorized`: Missing or invalid Bearer authentication token.
- `404 Not Found`: Session or task resource does not exist.
- `500 Internal Server Error`: Unexpected server or execution failure.
