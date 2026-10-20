"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

/* FR-007 logout: POST /api/auth/logout (cookie destruction is server-side),
 * then hard-navigate so middleware re-guards immediately. */
export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // even if the API is unreachable, leaving the app is the user's intent
    }
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      aria-label="Log out"
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${compact ? "h-9 w-9" : "h-9 px-3 text-sm font-medium"}`}
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      {!compact && "Log out"}
    </button>
  );
}
