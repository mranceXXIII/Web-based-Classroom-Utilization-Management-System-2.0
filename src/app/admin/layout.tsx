import { AppHeader } from "@/components/app-header";
import { LogoutButton } from "@/components/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";

/* Admin dashboard shell (FR-012/013): shared header + section sidebar.
 * Guards themselves are enforced by backend middleware (FR-007). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader actions={<LogoutButton compact />} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row">
        <aside className="md:w-52 md:shrink-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
