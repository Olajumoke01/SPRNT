import { useEffect } from "react";

export default function Timer({
  timeLeft,
  isRunning,
  onToggleRunning,
  onReset,
  onAddMinutes,
  onFinish,
}) {
  useEffect(() => {
    if (timeLeft <= 0 && isRunning && onFinish) {
      onFinish();
    }
  }, [timeLeft, isRunning, onFinish]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  // Dynamic warm tone shift matching illustration palette
  const isDanger = timeLeft <= 60;
  const isWarning = timeLeft <= 300 && !isDanger;

  const toneColor = isDanger
    ? "text-coral-500"
    : isWarning
    ? "text-marigold-600"
    : "text-periwinkle-600";

  const badgeBg = isDanger
    ? "bg-coral-50 text-coral-700 border-coral-200"
    : isWarning
    ? "bg-marigold-50 text-marigold-800 border-marigold-200"
    : "bg-periwinkle-50 text-periwinkle-700 border-periwinkle-200";

  const totalBlockSeconds = 15 * 60;
  const progressRatio = Math.max(0, Math.min(1, (totalBlockSeconds - timeLeft) / totalBlockSeconds));

  return (
    <div className="sprnt-card relative overflow-hidden p-6 sm:p-7">
      {/* Background soft glow */}
      <div
        className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          isDanger ? "bg-coral-500" : isWarning ? "bg-marigold-500" : "bg-periwinkle-500"
        }`}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Circular background track */}
            <svg className="h-20 w-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-sand-200"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`transition-all duration-1000 ${
                  isDanger
                    ? "stroke-coral-500"
                    : isWarning
                    ? "stroke-marigold-500"
                    : "stroke-periwinkle-500"
                }`}
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 * (1 - progressRatio)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-display text-xl font-black text-cocoa-900">
              {minutes}:{seconds}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`sprnt-pill border text-[11px] ${badgeBg}`}>
                <span
                  className={`h-2 w-2 rounded-full ${
                    isRunning ? "animate-ping bg-current" : "bg-cocoa-400"
                  }`}
                />
                {isRunning ? "Focus Sprint Active" : "Timer Paused"}
              </span>
              {isDanger && (
                <span className="text-xs font-semibold text-coral-600 animate-pulse">
                  Final Minute!
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-cocoa-600">
              15-minute chunk: Single task, no distractions.
            </p>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onToggleRunning && (
            <button
              type="button"
              onClick={onToggleRunning}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-display font-bold text-sm transition-all shadow-sm ${
                isRunning
                  ? "bg-sand-200 text-cocoa-800 hover:bg-sand-300 border border-sand-300"
                  : "bg-gradient-to-r from-periwinkle-500 to-periwinkle-600 text-white shadow-glow-periwinkle hover:brightness-105"
              }`}
            >
              {isRunning ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Resume
                </>
              )}
            </button>
          )}

          {onAddMinutes && (
            <button
              type="button"
              onClick={() => onAddMinutes(2)}
              title="Add 2 minutes grace period"
              className="rounded-2xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-xs font-bold text-cocoa-700 hover:bg-sand-200 transition-colors"
            >
              +2 min
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Reset timer to 15:00"
              className="rounded-2xl border border-sand-300 bg-sand-100 p-3 text-cocoa-600 hover:bg-sand-200 hover:text-cocoa-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
