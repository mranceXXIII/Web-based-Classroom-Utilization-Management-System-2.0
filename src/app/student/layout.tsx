import { AppHeader } from "@/components/app-header";
import { LogoutButton } from "@/components/logout-button";

/* Student shell (FR-023): same utilization view, read-only, no heartbeat. */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader actions={<LogoutButton compact />} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
