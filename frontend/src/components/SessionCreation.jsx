import { useState } from "react";

export default function SessionCreation({
  goal,
  setGoal,
  planningMode,
  setPlanningMode,
  sessionDuration,
  setSessionDuration,
  onCreate,
  loading,
  manualTasks,
  setManualTasks,
}) {
  const options = [15, 30, 45, 60, 90];
  const blockCount = Math.max(1, Math.round(sessionDuration / 15));
  const [newTaskInput, setNewTaskInput] = useState("");

  const sampleGoals = [
    "Draft the intro & outline for my report",
    "Clear email inbox and reply to top 3",
    "Study chapter 4 and make flashcards",
    "Tidy work desk and sort loose receipts",
  ];

  function addTask() {
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;
    setManualTasks((prev) => [...prev, trimmed]);
    setNewTaskInput("");
  }

  function removeTask(index) {
    setManualTasks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleTaskKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  }

  function moveTask(index, direction) {
    setManualTasks((prev) => {
      const next = [...prev];
      const swapIdx = index + direction;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
      return next;
    });
  }

  const canSubmit =
    goal.trim() &&
    (planningMode === "ai" || (planningMode === "manual" && manualTasks.length > 0));

  return (
    <div className="mx-auto max-w-2xl">
      {/* Decorative top badge */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-sand-100/80 px-4 py-1.5 shadow-sm">
          <span className="text-rosepetal-500 font-bold text-sm">✦</span>
          <span className="font-display text-xs font-bold uppercase tracking-widest text-cocoa-600">
            Neurodivergent-Friendly Sprint
          </span>
          <span className="text-marigold-500 font-bold text-sm">✦</span>
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-black tracking-tight text-cocoa-900">
          Turn a daunting task into <span className="text-periwinkle-600">gentle momentum</span>.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-cocoa-600 max-w-lg mx-auto">
          Overcome task paralysis. Pick your target time, and let our AI coach split it into actionable 15-minute micro-wins.
        </p>
      </div>

      <div className="sprnt-card p-6 sm:p-8 space-y-6">
        {/* Session length selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-500 mb-2">
            Target Focus Duration
          </label>
          <div className="grid grid-cols-5 gap-2">
            {options.map((minutes) => {
              const blocks = Math.round(minutes / 15);
              const isSelected = sessionDuration === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setSessionDuration(minutes)}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-periwinkle-500 bg-periwinkle-50 text-periwinkle-900 ring-2 ring-periwinkle-400/40 shadow-sm"
                      : "border-sand-200 bg-white/70 text-cocoa-700 hover:border-sand-300 hover:bg-sand-50"
                  }`}
                >
                  <span className="font-display text-lg font-black">{minutes}m</span>
                  <span className="text-[10px] font-semibold text-cocoa-500 mt-0.5">
                    {blocks} {blocks === 1 ? "block" : "blocks"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-cocoa-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-marigold-500" />
            <span>
              This will create <strong className="text-cocoa-800">{blockCount} focus block{blockCount > 1 ? "s" : ""}</strong> of exactly 15 minutes each.
            </span>
          </div>
        </div>

        {/* Breakdown Mode Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-500 mb-2">
            Planning Style
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPlanningMode("ai")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                planningMode === "ai"
                  ? "border-periwinkle-500 bg-gradient-to-br from-periwinkle-50 via-white to-periwinkle-50/50 ring-2 ring-periwinkle-400/30 shadow-sm"
                  : "border-sand-200 bg-white/60 hover:bg-sand-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-periwinkle-500 text-white text-xs font-bold shadow-sm">
                  ✨
                </span>
                <span className="font-display font-black text-cocoa-900">Let AI Break It Down</span>
              </div>
              <p className="mt-2 text-xs text-cocoa-600 leading-relaxed">
                Our AI coach creates low-friction 15-minute micro-tasks tailored to defeat ADHD hesitation.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPlanningMode("manual")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                planningMode === "manual"
                  ? "border-coral-500 bg-gradient-to-br from-coral-50 via-white to-coral-50/50 ring-2 ring-coral-400/30 shadow-sm"
                  : "border-sand-200 bg-white/60 hover:bg-sand-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral-500 text-white text-xs font-bold shadow-sm">
                  ✍️
                </span>
                <span className="font-display font-black text-cocoa-900">I'll Set the Steps</span>
              </div>
              <p className="mt-2 text-xs text-cocoa-600 leading-relaxed">
                Define each focus block yourself — actively thinking through your plan builds clarity.
              </p>
            </button>
          </div>
        </div>

        {/* Goal Input Field */}
        <div>
          <label htmlFor="goal" className="block text-xs font-bold uppercase tracking-wider text-cocoa-500 mb-2">
            {planningMode === "ai"
              ? "What do you want to make headway on?"
              : "Session title / overall goal"}
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={planningMode === "manual" ? 2 : 3}
            placeholder={
              planningMode === "ai"
                ? "E.g., Write the first draft of my essay, organize my tax folders, or build the app navigation..."
                : "E.g., Study session, Project sprint, Writing chapter 2..."
            }
            className="w-full rounded-2xl border border-sand-300 bg-white px-4 py-3.5 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-periwinkle-500 focus:ring-4 focus:ring-periwinkle-100 transition outline-none"
          />

          {/* Quick inspiration pills — only for AI mode */}
          {planningMode === "ai" && (
            <div className="mt-2.5">
              <span className="text-[11px] font-semibold text-cocoa-500">Need inspiration? Click one:</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {sampleGoals.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGoal(sample)}
                    className="rounded-full border border-sand-300 bg-sand-100/90 px-2.5 py-1 text-[11px] font-medium text-cocoa-700 hover:border-periwinkle-400 hover:bg-periwinkle-50 hover:text-periwinkle-800 transition"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual Task Entry — only for manual mode */}
        {planningMode === "manual" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-500 mb-2">
              Your Focus Blocks{" "}
              <span className="text-cocoa-400 normal-case font-normal tracking-normal ml-1">
                — add each one and actively think it through
              </span>
            </label>

            {/* Existing tasks list */}
            {manualTasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {manualTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-2xl border border-sand-200 bg-white/80 px-4 py-2.5 group"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral-100 text-coral-700 text-[11px] font-black">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-cocoa-900 truncate">{task}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => moveTask(i, -1)}
                        disabled={i === 0}
                        className="p-1 rounded-lg text-cocoa-400 hover:text-cocoa-700 hover:bg-sand-100 disabled:opacity-30 transition text-xs"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTask(i, 1)}
                        disabled={i === manualTasks.length - 1}
                        className="p-1 rounded-lg text-cocoa-400 hover:text-cocoa-700 hover:bg-sand-100 disabled:opacity-30 transition text-xs"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTask(i)}
                        className="p-1 rounded-lg text-coral-400 hover:text-coral-600 hover:bg-coral-50 transition text-xs"
                        aria-label="Remove task"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new task input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={handleTaskKeyDown}
                placeholder={
                  manualTasks.length === 0
                    ? "What's the first thing you'll tackle? (e.g. Open document & read notes)"
                    : `Block ${manualTasks.length + 1}: What comes next?`
                }
                className="flex-1 rounded-2xl border border-sand-300 bg-white px-4 py-3 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-coral-400 focus:ring-4 focus:ring-coral-100 transition outline-none"
              />
              <button
                type="button"
                onClick={addTask}
                disabled={!newTaskInput.trim()}
                className="shrink-0 rounded-2xl bg-coral-500 text-white px-4 py-3 text-sm font-bold hover:bg-coral-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                + Add
              </button>
            </div>

            {manualTasks.length === 0 && (
              <p className="mt-2 text-[11px] text-cocoa-500">
                💡 Think it through: each block should be one clear, completable action. Press Enter or click Add after each one.
              </p>
            )}

            {manualTasks.length > 0 && (
              <p className="mt-2 text-[11px] text-cocoa-500">
                {manualTasks.length} block{manualTasks.length > 1 ? "s" : ""} added. Add more or start your sprint below.
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onCreate}
          disabled={loading || !canSubmit}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-marigold-400 via-marigold-500 to-amber-500 py-4 px-6 font-display text-base font-black text-cocoa-900 shadow-glow-marigold transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-cocoa-900 border-t-transparent" />
              <span>
                {planningMode === "ai"
                  ? "AI Coach is crafting your 15-minute micro-blocks..."
                  : "Starting your sprint..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{planningMode === "ai" ? "Start Sprint with AI Guidance" : "Start My 15-Min Sprint"}</span>
              <span className="text-lg">➔</span>
            </div>
          )}
        </button>

        {loading && (
          <div className="p-3.5 rounded-2xl bg-sand-100/80 border border-sand-200 text-center animate-pulse">
            <p className="text-xs font-semibold text-cocoa-700">
              💡 ADHD Focus Tip: The first 5 minutes of any task feel the hardest due to dopamine lag. Once your 15m timer starts, momentum takes over!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
