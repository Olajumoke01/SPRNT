import { useState } from "react";
import { api } from "../services/api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both username and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let res;
      if (mode === "register") {
        res = await api.register(username.trim(), password);
      } else {
        res = await api.login(username.trim(), password);
      }
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md sprnt-card p-6 sm:p-8 shadow-2xl border border-sand-300">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-cocoa-400 hover:text-cocoa-800 p-1.5 rounded-full hover:bg-sand-200 transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-periwinkle-500 to-rosepetal-500 text-white text-2xl shadow-glow-periwinkle mb-1">
            🦋
          </div>
          <h2 className="font-display text-2xl font-black text-cocoa-900 tracking-tight">
            {mode === "login" ? "Welcome Back to SPRNT" : "Create Your Focus Account"}
          </h2>
          <p className="text-xs text-cocoa-600">
            {mode === "login"
              ? "Sign in to access your saved sprints and focus streaks."
              : "No email required. Pick a username and password to track your progress."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-sand-200/80 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`py-2 rounded-xl transition ${
              mode === "login"
                ? "bg-white text-cocoa-900 shadow-sm"
                : "text-cocoa-600 hover:text-cocoa-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`py-2 rounded-xl transition ${
              mode === "register"
                ? "bg-white text-cocoa-900 shadow-sm"
                : "text-cocoa-600 hover:text-cocoa-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-coral-50 border border-coral-200 text-xs font-semibold text-coral-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-600 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., jummy"
              className="w-full rounded-2xl border border-sand-300 bg-white px-4 py-3 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-periwinkle-500 focus:ring-4 focus:ring-periwinkle-100 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-600 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              className="w-full rounded-2xl border border-sand-300 bg-white px-4 py-3 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:border-periwinkle-500 focus:ring-4 focus:ring-periwinkle-100 transition outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-r from-marigold-400 via-marigold-500 to-amber-500 py-3.5 font-display text-sm font-black text-cocoa-900 shadow-glow-marigold transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cocoa-900 border-t-transparent" />
                <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
              </>
            ) : (
              <span>{mode === "login" ? "Sign In to SPRNT" : "Create My Account"}</span>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-cocoa-500">
          SPRNT keeps your data private and local to your device & account.
        </p>
      </div>
    </div>
  );
}
