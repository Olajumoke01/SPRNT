import ProgressBar from "./ProgressBar";

export default function SessionActive({
  task,
  tasks,
  currentTaskIndex,
  message,
  response,
  setResponse,
  onSubmit,
  onEndSession,
  isSubmitting,
  total,
  completed,
}) {
  const currentBlockNum = Math.min(currentTaskIndex + 1, tasks.length || 1);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Active Task Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-periwinkle-600 via-periwinkle-700 to-indigo-800 p-6 sm:p-8 text-white shadow-glow-periwinkle">
        {/* Soft background decorative elements */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-marigold-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-rosepetal-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md text-periwinkle-100">
              <span className="h-2 w-2 rounded-full bg-marigold-400 animate-ping" />
              <span>Current 15-Min Focus Block ({currentBlockNum}/{tasks.length || 1})</span>
            </div>

            <button
              type="button"
              onClick={onEndSession}
              className="text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition"
            >
              End Session Early
            </button>
          </div>

          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-black leading-snug tracking-tight text-white">
            {task?.title || "Focusing on your goal..."}
          </h2>

          <div className="mt-4 flex items-center gap-2 text-xs text-periwinkle-100/90 font-medium">
            <span className="text-marigold-300">★</span>
            <span>Zero multitasking. Pour your attention exclusively into this single piece.</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Segmented */}
      <div className="sprnt-card p-5">
        <ProgressBar completed={completed} total={total} />
      </div>

      {/* Check-in Card */}
      <div className="sprnt-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cocoa-500">
              Accountability Check-In
            </span>
            <h3 className="text-lg font-display font-black text-cocoa-900 mt-0.5">
              What did you finish in this 15-minute block?
            </h3>
          </div>
          <span className="text-xl">✍️</span>
        </div>

        <p className="text-xs text-cocoa-600">
          Keep it brief! Even &quot;drafted 2 lines&quot; or &quot;cleared the desk&quot; counts as concrete executive function victory.
        </p>

        <textarea
          rows={3}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="E.g., I wrote the first two paragraphs and found two research sources..."
          className="w-full rounded-2xl border border-sand-300 bg-white px-4 py-3 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-periwinkle-500 focus:ring-4 focus:ring-periwinkle-100 transition outline-none"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !response.trim()}
          className="w-full rounded-2xl bg-gradient-to-r from-marigold-400 via-marigold-500 to-amber-500 py-3.5 px-5 font-display text-sm font-black text-cocoa-900 shadow-glow-marigold transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-cocoa-900 border-t-transparent" />
              <span>Checking in with AI coach...</span>
            </>
          ) : (
            <>
              <span>Log Completion & Get Next Step</span>
              <span>➔</span>
            </>
          )}
        </button>
      </div>

      {/* AI Coach Feedback Bubble */}
      {message && (
        <div className="relative overflow-hidden rounded-3xl border border-periwinkle-200 bg-gradient-to-br from-periwinkle-50 via-white to-periwinkle-50/60 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rosepetal-500 to-coral-400 text-white shadow-md text-lg">
              🦋
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-extrabold uppercase tracking-widest text-periwinkle-700">
                  SPRNT AI Coach Feedback
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-periwinkle-500" />
                <span className="text-[11px] font-semibold text-cocoa-500">Just now</span>
              </div>
              <p className="mt-2 text-sm sm:text-base font-medium leading-relaxed text-cocoa-800">
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Focus Blocks Checklist */}
      <div className="sprnt-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-display text-base font-bold text-cocoa-900">
            Sprint Focus Map
          </h4>
          <span className="rounded-full bg-sand-200 px-3 py-1 text-xs font-bold text-cocoa-700">
            {completed} / {total} Done
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.map((item, index) => {
            const isActive = index === currentTaskIndex;
            const isDone = item.status === "completed";

            return (
              <div
                key={item.id || index}
                className={`flex items-center gap-3.5 rounded-2xl p-3.5 text-sm transition-all ${
                  isDone
                    ? "border border-rosepetal-200/80 bg-rosepetal-50/50 text-cocoa-600"
                    : isActive
                    ? "border-2 border-periwinkle-500 bg-periwinkle-50/60 font-semibold text-cocoa-900 shadow-sm"
                    : "border border-sand-200 bg-white/60 text-cocoa-600"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isDone
                      ? "bg-rosepetal-500 text-white shadow-sm"
                      : isActive
                      ? "bg-periwinkle-500 text-white ring-2 ring-periwinkle-300"
                      : "bg-sand-200 text-cocoa-500"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </span>

                <span className={`flex-1 leading-snug ${isDone ? "line-through opacity-70" : ""}`}>
                  {item.title}
                </span>

                {isActive && (
                  <span className="rounded-full bg-periwinkle-500 px-2 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
