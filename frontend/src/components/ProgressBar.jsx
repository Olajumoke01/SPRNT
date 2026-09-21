export default function ProgressBar({ completed, total }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-cocoa-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-periwinkle-500 animate-pulse" />
          Session Momentum
        </span>
        <span className="font-display text-sm font-black text-cocoa-900">
          {completed} of {total} blocks completed <span className="text-periwinkle-600 font-bold ml-1">({percentage}%)</span>
        </span>
      </div>

      {/* Segmented block pills */}
      <div className="grid grid-flow-col auto-cols-fr gap-2 h-3.5">
        {Array.from({ length: total || 1 }).map((_, index) => {
          const isDone = index < completed;
          const isActive = index === completed;

          return (
            <div
              key={index}
              className={`relative h-full rounded-full transition-all duration-500 overflow-hidden ${
                isDone
                  ? "bg-gradient-to-r from-rosepetal-500 to-coral-500 shadow-sm"
                  : isActive
                  ? "bg-periwinkle-500 ring-2 ring-periwinkle-300 ring-offset-1 animate-pulse"
                  : "bg-sand-200/90 border border-sand-300"
              }`}
            >
              {isDone && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
