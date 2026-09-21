# Sprnt - Specification

## Overview
Sprnt is an AI-guided focus tool for people with attention challenges. Users break tasks into 15-minute chunks, work through sessions with AI check-ins every 15 minutes, and track their progress. 

This application was a test in spec-driven-development

## Core Flow
1. User creates a session and enters a goal
2. App breaks goal into 15-minute subtasks (with AI help)
3. Timer starts, user works
4. Every 15 mins: AI check-in ("What did you finish? Ready for next?")
5. User logs what they completed
6. Progress tracked and visible

---

## Backend (Python)

### Tech Stack
- **Framework**: Flask or FastAPI (FastAPI recommended for cleaner async)
- **Database**: SQLite for v1 (local), PostgreSQL for later scaling
- **AI**: Free AI API for check-ins - that will ask what has been accomplished and give feedback
- **Auth**: Simple for v1 (could add later)

### Database Schema

#### Users Table
```
id (int, primary key)
username (str, unique)
created_at (datetime)
```

#### Sessions Table
```
id (int, primary key)
user_id (int, foreign key)
title (str) - "Write report", "Finish project", etc
status (enum) - "active", "completed", "abandoned"
created_at (datetime)
completed_at (datetime, nullable)
```

#### Tasks Table
```
id (int, primary key)
session_id (int, foreign key)
title (str) - the 15-min task
order (int) - position in session
status (enum) - "todo", "in_progress", "completed"
created_at (datetime)
completed_at (datetime, nullable)
```

#### CheckIns Table
```
id (int, primary key)
session_id (int, foreign key)
task_id (int, foreign key)
timestamp (datetime)
user_response (str) - what they said they finished
ai_message (str) - what the AI said
```

### API Endpoints

**POST /sessions**
- Input: `{title: "Write report", description: "optional"}`
- Output: `{session_id, tasks: [{id, title, status}]}`
- Logic: Create session, call AI to break into 15-min tasks, return

**GET /sessions/{session_id}**
- Output: Full session with all tasks and check-ins

**POST /tasks/{task_id}/complete**
- Input: `{user_response: "finished the intro section"}`
- Output: `{completed: true, next_task: {...}, ai_message: "Great, now try..."}`
- Logic: Mark task done, log check-in, generate AI response, return next task

**GET /sessions/{session_id}/progress**
- Output: `{completed_count, total_count, tasks_done: [...]}`

**POST /sessions/{session_id}/end**
- Input: `{}`
- Output: `{session_summary: {...}}`
- Logic: Mark session complete, calculate stats

### AI Integration

**Breaking down tasks:**
```
Prompt to Claude:
"Break this into 5-7 simple 15-minute tasks: [user goal]
Return as JSON: {tasks: [{title: str, description: str}]}"
```

**Check-ins:**
```
Prompt to Claude:
"User just finished: '[user_response]'
Next task is: '[next_task_title]'
Give a 1-2 sentence encouraging response and remind them of the next task.
Keep it brief and motivating."
```

### Code Structure
```
backend/
  app.py              # Flask/FastAPI setup
  models.py           # Database models
  routes/
    sessions.py       # /sessions endpoints
    tasks.py          # /tasks endpoints
  services/
    ai_service.py     # Claude API calls
    task_service.py   # Task logic
  config.py           # Settings, API keys
  requirements.txt
```

### Best Practices
- Use dependency injection for services (pass AI service to routes)
- Type hints on all functions
- Separate business logic from routes
- Error handling for AI API failures (retry, fallback message)
- Logging for debugging

---

## Frontend (React)

### Tech Stack
- **Framework**: React with hooks
- **Styling**: Tailwind CSS
- **State**: React Context API (keep it simple) or Zustand if needed later
- **HTTP**: axios or fetch
- **UI**: Keep it minimal and clean

### Pages/Components

**SessionCreation**
- Input field for goal
- Button to create session
- Shows loading while AI breaks it down
- Navigates to SessionActive when done

**SessionActive**
- Display current task (large, clear)
- Timer (visual countdown from 15:00)
- Text input for "what did you finish?"
- Button to submit and move to next
- AI response shown below
- Progress bar showing tasks completed/total

**SessionComplete**
- Summary: tasks done, time taken, encouraging message
- Option to start new session or rest
- Link to view past sessions

**Dashboard**
- List of recent sessions (completed, in progress, abandoned)
- Stats (total sessions, total tasks completed)
- Button to new session

### Component Structure
```
src/
  components/
    SessionCreation.jsx
    SessionActive.jsx
    SessionComplete.jsx
    Dashboard.jsx
    Timer.jsx
    ProgressBar.jsx
  hooks/
    useSession.js     # Session logic
    useTimer.js       # Timer logic
  services/
    api.js            # API calls
  App.jsx
  index.css
```

### Key Interactions

**Timer:**
- Counts down from 15:00
- Visual indicator (color changes as time runs out)
- Auto-calls check-in at 0:00 (optional: auto-move to next task)

**Check-in:**
- User types response, hits "Done"
- Shows loading spinner
- AI response appears
- "Next Task" button becomes active
- On click, move to next task or show completion

### Best Practices
- Keep components small and focused
- Use custom hooks for logic (useTimer, useSession)
- Handle API errors with user-friendly messages
- Show loading states during API calls
- No excessive re-renders (memoize if needed)
- Accessibility: buttons have labels, inputs are labeled

---

## Integration

### Data Flow
1. Frontend: User enters goal → POST /sessions
2. Backend: Break into tasks → respond with session + tasks
3. Frontend: Display first task + timer
4. Every 15 mins: User submits response → POST /tasks/{task_id}/complete
5. Backend: Log check-in, call AI, return response + next task
6. Frontend: Show response, move to next task
7. Repeat until session complete

### Error Handling
- AI API fails: Show friendly message, let user continue or retry
- Session not found: Redirect to dashboard
- Network error: Show retry button

---

## v1 Scope (Build This First)
- Create sessions
- Break tasks into 15-min chunks (AI)
- Timer + task tracking
- AI check-ins
- View current session progress
- Complete session

## v2 (Later)
- Past sessions history
- Stats/analytics
- Customize session length (10 min, 25 min, etc)
- User accounts / persistence
- Mobile app

---

## Getting Started
1. Set up Flask/FastAPI + SQLite locally
2. Create database schema
3. Build /sessions endpoint (task breakdown)
4. Build /tasks/{id}/complete endpoint (check-ins)
5. React frontend with Timer + SessionActive
6. Connect frontend to backend
7. Test with yourself
8. Iterate based on what works/doesn't

Keep it simple. Ship v1 fast. Learn from real use.