import { AppHeader } from "@/components/app-header";
import { RoleSelectForm } from "@/components/role-select";

/* FR-001 — landing ported from index.php: the RSU banner (AppHeader), then the
 * white "Select an option" card with the 4px green top border and soft shadow,
 * then the RSU footer (root layout). Same radio → Submit → role-login flow as
 * redirect.php provided. The theme toggle lives in the banner (FR-032). */
export default function LandingPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-14 sm:px-6">
        <div className="w-full max-w-xs rounded-lg border border-border border-t-4 border-t-rsu bg-surface p-6 shadow-[0_4px_14px_rgba(21,36,31,0.18)]">
          <RoleSelectForm />
        </div>
        <p className="mt-6 text-xs text-muted">
          Romblon State University — Cajidiocan Campus · Education Department
        </p>
      </main>
    </>
  );
}

