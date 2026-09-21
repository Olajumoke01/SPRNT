export default function Dashboard({ sessions = [], onNewSession, onOpenSession, onDeleteSession }) {
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const activeCount = sessions.filter((s) => s.status === "active").length;

  // Calculate total focus minutes from completed sessions
  const totalMinutes = sessions.reduce((acc, s) => {
    const dur = Number(s.duration_minutes) || 30;
    if (s.status === "completed") return acc + dur;
    const completedBlocks = Number(s.completed_tasks) || 0;
    return acc + completedBlocks * 15;
  }, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-periwinkle-700">
            <span>🦋</span>
            <span>Focus Overview</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 tracking-tight mt-1">
            Your Focus Dashboard
          </h1>
          <p className="text-sm text-cocoa-600 mt-1">
            Every 15 minutes of structured work protects your mental energy.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-marigold-400 via-marigold-500 to-amber-500 py-3.5 px-6 font-display text-sm font-black text-cocoa-900 shadow-glow-marigold transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <span>Start New Sprint</span>
          <span>➔</span>
        </button>
      </div>

      {/* Metric Cards in Illustration Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Sprints */}
        <div className="sprnt-card p-5 border-l-4 border-l-periwinkle-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa-500">
              Total Sprints
            </span>
            <span className="text-base">🦋</span>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-cocoa-900">
            {sessions.length}
          </p>
          <span className="text-[11px] font-medium text-periwinkle-700">
            {activeCount} currently active
          </span>
        </div>

        {/* Card 2: Completed Sprints */}
        <div className="sprnt-card p-5 border-l-4 border-l-rosepetal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa-500">
              Finished Sprints
            </span>
            <span className="text-base">🌸</span>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-cocoa-900">
            {completedCount}
          </p>
          <span className="text-[11px] font-medium text-rosepetal-700">
            Micro-goals reached
          </span>
        </div>

        {/* Card 3: Focused Minutes */}
        <div className="sprnt-card p-5 border-l-4 border-l-marigold-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa-500">
              Focus Time
            </span>
            <span className="text-base">✦</span>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-cocoa-900">
            {totalMinutes}m
          </p>
          <span className="text-[11px] font-medium text-marigold-700">
            Accumulated focus
          </span>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="sprnt-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-cocoa-900">
            Sprint History
          </h2>
          <span className="text-xs font-semibold text-cocoa-500">
            Showing latest sessions
          </span>
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <span className="text-3xl">🌱</span>
              <p className="mt-2 font-display font-bold text-cocoa-900">No sessions logged yet.</p>
              <p className="text-xs text-cocoa-500 mt-1 max-w-xs mx-auto">
                Ready to break your first task into bite-sized 15-minute chunks?
              </p>
              <button
                type="button"
                onClick={onNewSession}
                className="mt-4 inline-block rounded-2xl bg-periwinkle-500 text-white font-bold text-xs px-4 py-2 hover:bg-periwinkle-600 transition"
              >
                Create your first sprint
              </button>
            </div>
          ) : (
            sessions.map((item) => {
              const isDone = item.status === "completed";
              const total = item.total_tasks || 0;
              const done = item.completed_tasks || 0;

              return (
                <div
                  key={item.id}
                  className="sprnt-card-interactive p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`sprnt-pill text-[10px] py-0.5 px-2.5 border ${
                          isDone
                            ? "bg-rosepetal-50 text-rosepetal-700 border-rosepetal-200"
                            : "bg-periwinkle-50 text-periwinkle-700 border-periwinkle-200"
                        }`}
                      >
                        {isDone ? "Completed" : "In Progress"}
                      </span>
                      <span className="text-xs text-cocoa-400">
                        {item.duration_minutes || 30} min session
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-cocoa-900 truncate">
                      {item.title}
                    </h3>

                    {total > 0 && (
                      <p className="text-xs text-cocoa-600">
                        {done}/{total} 15-minute blocks finished
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenSession(item.id)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                        isDone
                          ? "bg-sand-200 text-cocoa-800 hover:bg-sand-300"
                          : "bg-periwinkle-500 text-white shadow-sm hover:bg-periwinkle-600"
                      }`}
                    >
                      {isDone ? "Review Summary" : "Resume Sprint ➔"}
                    </button>

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                            onDeleteSession(item.id);
                          }
                        }}
                        className="rounded-xl px-3 py-2.5 text-xs font-bold text-cocoa-400 hover:bg-coral-50 hover:text-coral-600 border border-transparent hover:border-coral-200 transition"
                        aria-label="Delete session"
                        title="Delete session"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
