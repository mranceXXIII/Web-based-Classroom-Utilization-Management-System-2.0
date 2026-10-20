import { AppHeader } from "@/components/app-header";
import { Heartbeat } from "@/components/heartbeat";
import { LogoutButton } from "@/components/logout-button";

/* Faculty shell (FR-022): heartbeat indicator lives in the shared header. */
export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader actions={<><LogoutButton compact /><Heartbeat /></>} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
