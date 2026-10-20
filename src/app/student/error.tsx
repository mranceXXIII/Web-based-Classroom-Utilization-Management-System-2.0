"use client";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/notice";

export default function UtilizationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold tracking-tight text-text">Something went wrong</h1>
      <Notice variant="error" title="The schedule view could not be loaded">
        The server hit an unexpected error while building the room schedules.
      </Notice>
      <div>
        <Button onClick={reset}>Try again</Button>
      </div>
    </section>
  );
}
