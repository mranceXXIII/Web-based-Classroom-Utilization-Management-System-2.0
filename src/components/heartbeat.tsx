"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { apiFetch } from "@/components/api-client";

/* FR-022 — faculty presence heartbeat: polls /api/heartbeat every 60s and shows
 * the last-beat time. Effect cleanup cancels the interval + in-flight request
 * (react.md #6). aria-live announces state changes for screen readers. */
export function Heartbeat() {
  const [lastBeat, setLastBeat] = useState<string | null>(null);
  const [state, setState] = useState<"pending" | "ok" | "error">("pending");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function ping() {
      try {
        const data = await apiFetch<{ lastHeartbeat: string | null }>("/api/heartbeat", {
          signal: controller.signal,
        });
        setLastBeat(data.lastHeartbeat);
        setState("ok");
      } catch (err) {
        if (controller.signal.aborted) return;
        setState("error");
      }
    }

    ping();
    timerRef.current = setInterval(ping, 60_000);
    return () => {
      controller.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const time = lastBeat ? new Date(lastBeat).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div
      aria-live="polite"
      className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted"
      title="Presence heartbeat — sent automatically every 60 seconds"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            state === "ok" ? "bg-success opacity-75 heartbeat-pulse" : state === "error" ? "bg-danger" : "bg-muted"
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            state === "ok" ? "bg-success" : state === "error" ? "bg-danger" : "bg-muted"
          }`}
        />
      </span>
      <Activity aria-hidden="true" className="h-3.5 w-3.5" />
      <span className="tabular-nums">
        {state === "pending" && "Heartbeat…"}
        {state === "ok" && (time ? `Last beat ${time}` : "Heartbeat sent")}
        {state === "error" && "Heartbeat unreachable"}
      </span>
    </div>
  );
}
