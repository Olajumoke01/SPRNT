export default function SessionComplete({ summary, onNewSession, onDashboard }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="sprnt-card relative overflow-hidden p-8 sm:p-10 space-y-6">
        {/* Soft celebration ambient backdrop */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-marigold-300/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-rosepetal-300/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-marigold-400 via-rosepetal-400 to-periwinkle-500 text-white text-4xl shadow-glow-marigold animate-gentle-pulse">
            🌸
          </div>

          <div className="space-y-2">
            <span className="sprnt-pill border border-periwinkle-200 bg-periwinkle-50 text-periwinkle-700 text-xs">
              ✦ Sprint Finished ✦
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-cocoa-900 tracking-tight">
              Focus Victory Achieved!
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-sand-100/90 border border-sand-200">
            <p className="text-base sm:text-lg font-medium text-cocoa-800 leading-relaxed">
              {summary}
            </p>
          </div>

          <p className="text-xs text-cocoa-500 max-w-sm mx-auto">
            You pushed through friction and built genuine executive momentum. Take a gentle stretch and drink some water!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={onNewSession}
            className="flex-1 rounded-2xl bg-gradient-to-r from-marigold-400 via-marigold-500 to-amber-500 py-3.5 px-5 font-display text-sm font-black text-cocoa-900 shadow-glow-marigold transition-all hover:brightness-105 active:scale-[0.99]"
          >
            Start Another 15m Sprint ➔
          </button>
          <button
            type="button"
            onClick={onDashboard}
            className="flex-1 rounded-2xl border border-sand-300 bg-white py-3.5 px-5 font-display text-sm font-bold text-cocoa-800 hover:bg-sand-100 transition-colors"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
