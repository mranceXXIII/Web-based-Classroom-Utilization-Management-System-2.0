import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AuthForm } from "@/components/auth-form";
import type { Role } from "@/lib/types";

/* FR-002/003 — per-role login. Next.js 15: params is a Promise. */
const ROLES: Role[] = ["ADMIN", "FACULTY", "STUDENT"];

export default async function LoginPage({ params }: { params: Promise<{ role: string }> }) {
  const { role: raw } = await params;
  const role = raw.toUpperCase() as Role;
  if (!ROLES.includes(role)) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <AuthForm role={role} mode="login" />
      </main>
    </div>
  );
}
