"use client";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/notice";

/* Route-level error boundary (react.md #39): message + recovery action. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight text-text">Something went wrong</h1>
      <Notice variant="error" title="This section could not be loaded">
        The server hit an unexpected error. Retry, or go back to the overview.
      </Notice>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => { window.location.href = "/admin"; }}>Overview</Button>
      </div>
    </section>
  );
}
