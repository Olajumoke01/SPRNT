import { useEffect, useMemo, useState } from "react";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import SessionActive from "./components/SessionActive";
import SessionComplete from "./components/SessionComplete";
import SessionCreation from "./components/SessionCreation";
import Timer from "./components/Timer";
import { api, getStoredToken } from "./services/api";

const SESSION_LENGTH_SECONDS = 15 * 60;

export default function App() {
  const [view, setView] = useState("dashboard");
  const [goal, setGoal] = useState("");
  const [planningMode, setPlanningMode] = useState("ai");
  const [sessionDuration, setSessionDuration] = useState(30);
  const [manualTasks, setManualTasks] = useState([]);
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(SESSION_LENGTH_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionSummary, setSessionSummary] = useState("");

  // Auth state
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const currentTask = tasks[currentTaskIndex] || null;

  // On mount: restore session from stored token
  useEffect(() => {
    async function tryRestoreSession() {
      const token = getStoredToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setUser(res.user);
          }
        } catch {
          // token invalid/expired — ignore, stay logged out
        }
      }
      setAuthLoading(false);
    }
    tryRestoreSession();
  }, []);

  // Load real sessions from backend (filtered by auth token automatically via api)
  async function loadSessions() {
    try {
      const data = await api.getSessions();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.warn("Could not load sessions from backend:", err);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadSessions();
    }
  }, [authLoading, user]);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  // When timer hits 0 during active session
  useEffect(() => {
    if (timeLeft === 0 && session && view === "active") {
      handleTaskSubmit(true);
    }
  }, [timeLeft, session, view]);

  const progressText = useMemo(() => {
    if (!session) return "No active session";
    return `${completedTasks}/${totalTasks} blocks completed`;
  }, [completedTasks, totalTasks, session]);

  async function handleCreateSession() {
    if (!goal.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const tasksToSend = planningMode === "manual" && manualTasks.length > 0 ? manualTasks : null;
      const result = await api.createSession(goal.trim(), "", planningMode, sessionDuration, tasksToSend);
      setSession({
        id: result.session_id,
        title: result.title,
        description: result.description,
        duration_minutes: result.duration_minutes,
        planning_mode: result.planning_mode,
      });
      setTasks(result.tasks || []);
      setCurrentTaskIndex(0);
      setMessage("");
      setResponse("");
      setView("active");
      setTimerRunning(true);
      setTimeLeft(SESSION_LENGTH_SECONDS);
      setManualTasks([]);
      loadSessions();
    } catch (error) {
      setMessage(error.message || "Unable to create sprint session.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTaskSubmit(isTimerFinish = false) {
    if (!currentTask) return;

    setSubmitting(true);
    try {
      const responseText = response.trim() || (isTimerFinish ? "Completed this 15-minute block." : "Made solid progress on this task.");
      const result = await api.completeTask(currentTask.id, responseText);
      setMessage(result.ai_message || "Great work keeping this focus momentum!");

      const nextIndex = tasks.findIndex((task) => task.id === currentTask.id) + 1;
      const nextTasks = tasks.map((task) =>
        task.id === currentTask.id ? { ...task, status: "completed" } : task
      );

      const updatedTasks = nextTasks.map((task, index) => {
        if (index === nextIndex && result.next_task && task.id === result.next_task.id) {
          return { ...task, status: "in_progress" };
        }
        return task;
      });

      setTasks(updatedTasks);
      setCurrentTaskIndex((prev) => Math.min(prev + 1, updatedTasks.length - 1));
      setResponse("");

      if (!result.next_task) {
        const finishedCount = updatedTasks.filter((task) => task.status === "completed").length;
        const finalSummary = `Outstanding work! You completed all ${finishedCount} of ${updatedTasks.length} focus blocks for "${session.title}".`;
        setSessionSummary(finalSummary);
        setView("complete");
        setTimerRunning(false);
        setTimeLeft(SESSION_LENGTH_SECONDS);
        loadSessions();
      } else {
        setTimerRunning(true);
        setTimeLeft(SESSION_LENGTH_SECONDS);
        loadSessions();
      }
    } catch (error) {
      setMessage(error.message || "Unable to save your progress check-in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEndSession() {
    if (!session) return;

    try {
      const result = await api.endSession(session.id);
      setSessionSummary(result.summary || "You finished a strong focus sprint.");
      setView("complete");
      setTimerRunning(false);
      loadSessions();
    } catch (error) {
      setMessage(error.message || "Unable to end this sprint.");
    }
  }

  function handleNewSession() {
    setView("create");
    setGoal("");
    setPlanningMode("ai");
    setSessionDuration(30);
    setManualTasks([]);
    setSession(null);
    setTasks([]);
    setCurrentTaskIndex(0);
    setMessage("");
    setResponse("");
    setSessionSummary("");
    setTimerRunning(false);
    setTimeLeft(SESSION_LENGTH_SECONDS);
  }

  async function handleOpenSession(sessionId) {
    try {
      const fullSession = await api.getSession(sessionId);
      if (!fullSession) return;

      setSession({
        id: fullSession.id,
        title: fullSession.title,
        description: fullSession.description,
        duration_minutes: fullSession.duration_minutes,
      });

      const sessionTasks = fullSession.tasks || [];
      setTasks(sessionTasks);

      if (fullSession.status === "completed") {
        const completedCount = sessionTasks.filter((t) => t.status === "completed").length;
        setSessionSummary(`Sprint "${fullSession.title}" completed (${completedCount}/${sessionTasks.length} blocks).`);
        setView("complete");
        setTimerRunning(false);
      } else {
        // Find first incomplete task
        const firstIncomplete = sessionTasks.findIndex((t) => t.status !== "completed");
        setCurrentTaskIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
        setView("active");
        setTimerRunning(true);
        setTimeLeft(SESSION_LENGTH_SECONDS);
      }
    } catch (err) {
      console.error("Failed to open session:", err);
    }
  }

  async function handleDeleteSession(sessionId) {
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
    setSessions([]);
    loadSessions(); // will reload unauthenticated (no sessions if backend scopes by user)
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE] bg-ripples text-cocoa-900 pb-16">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-sand-200/80 bg-[#F8F4EE]/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => setView("dashboard")}
            className="flex items-center gap-3 text-left transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-periwinkle-500 to-rosepetal-500 text-white shadow-glow-periwinkle text-xl">
              🦋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-black tracking-tight text-cocoa-900">
                  SPRNT
                </span>
                <span className="sprnt-pill border border-marigold-300 bg-marigold-100 text-marigold-800 text-[10px] py-0.5 px-2">
                   Focus
                </span>
              </div>
              <p className="text-[11px] font-medium text-cocoa-500">
                15-Minute Micro-Sprints • AI Accountability
              </p>
            </div>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition ${
                view === "dashboard"
                  ? "bg-cocoa-900 text-sand-50"
                  : "text-cocoa-700 hover:bg-sand-200"
              }`}
            >
              Dashboard
            </button>

            {session && view !== "dashboard" && (
              <button
                type="button"
                onClick={() => setView("active")}
                className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition ${
                  view === "active"
                    ? "bg-periwinkle-500 text-white shadow-glow-periwinkle"
                    : "border border-periwinkle-300 text-periwinkle-700 hover:bg-periwinkle-50"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                <span>Active Sprint</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNewSession}
              className="rounded-2xl bg-gradient-to-r from-marigold-400 via-marigold-500 to-amber-500 px-4 py-2 text-xs font-black text-cocoa-900 shadow-sm hover:brightness-105 transition"
            >
              + New Sprint
            </button>

            {/* Auth button */}
            {!authLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-sand-300 bg-sand-100 px-3 py-2 text-xs font-bold text-cocoa-700">
                    <span>👤</span>
                    <span>{user.username}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl border border-sand-300 px-3.5 py-2 text-xs font-bold text-cocoa-500 hover:bg-sand-200 transition"
                    title="Sign out"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded-2xl border border-periwinkle-300 bg-periwinkle-50 px-4 py-2 text-xs font-bold text-periwinkle-700 hover:bg-periwinkle-100 transition"
                >
                  Sign in
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 pt-7 sm:pt-9">
        {/* Active Session Info Bar */}
        {session && view === "active" && (
          <div className="mb-6 sprnt-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-l-4 border-l-periwinkle-500">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-periwinkle-600">
                  Sprint in progress
                </span>
                <span className="text-sand-400">•</span>
                <span className="text-xs text-cocoa-500">
                  {session.duration_minutes || 30} minutes total
                </span>
              </div>
              <h2 className="font-display text-lg font-black text-cocoa-900 mt-0.5">
                {session.title}
              </h2>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="sprnt-pill border border-sand-300 bg-sand-100 text-cocoa-800 text-[11px]">
                {progressText}
              </span>
            </div>
          </div>
        )}

        {/* Focus Timer Display (during active sprint) */}
        {session && view === "active" && (
          <div className="mb-6">
            <Timer
              timeLeft={timeLeft}
              isRunning={timerRunning}
              onToggleRunning={() => setTimerRunning((prev) => !prev)}
              onReset={() => setTimeLeft(SESSION_LENGTH_SECONDS)}
              onAddMinutes={(mins) => setTimeLeft((prev) => prev + mins * 60)}
              onFinish={() => setTimeLeft(0)}
            />
          </div>
        )}

        {/* Views */}
        {view === "dashboard" && (
          <Dashboard
            sessions={sessions}
            onNewSession={handleNewSession}
            onOpenSession={handleOpenSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {view === "create" && (
          <SessionCreation
            goal={goal}
            setGoal={setGoal}
            planningMode={planningMode}
            setPlanningMode={setPlanningMode}
            sessionDuration={sessionDuration}
            setSessionDuration={setSessionDuration}
            onCreate={handleCreateSession}
            loading={loading}
            manualTasks={manualTasks}
            setManualTasks={setManualTasks}
          />
        )}

        {view === "active" && currentTask && (
          <SessionActive
            task={currentTask}
            tasks={tasks}
            currentTaskIndex={currentTaskIndex}
            response={response}
            setResponse={setResponse}
            onSubmit={() => handleTaskSubmit(false)}
            onEndSession={handleEndSession}
            isSubmitting={submitting}
            total={totalTasks}
            completed={completedTasks}
            message={message}
          />
        )}

        {view === "complete" && (
          <SessionComplete
            summary={sessionSummary || "You completed a strong focus sprint."}
            onNewSession={handleNewSession}
            onDashboard={() => {
              loadSessions();
              setView("dashboard");
            }}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          setAuthModalOpen(false);
          loadSessions();
        }}
      />
    </div>
  );
}
