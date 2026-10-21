"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput, Select } from "@/components/ui/field";
import { Notice } from "@/components/notice";
import { ApiError, apiFetch } from "@/components/api-client";
import { mockBlocks, mockFaculty } from "@/components/mocks";
import type { Role } from "@/lib/types";

/* Single consistent auth form for every role & mode (FR-002..FR-006, FR-030).
 * Posts to the frozen API contract (PLAN.md); inline field errors come from the
 * error envelope `fields`; success redirects to the role dashboard. */

export type AuthMode = "login" | "register";

const roleLabel: Record<Role, string> = { ADMIN: "Admin", FACULTY: "Faculty", STUDENT: "Student" };
const dashboard: Record<Role, string> = { ADMIN: "/admin", FACULTY: "/faculty", STUDENT: "/student" };

const endpoint = (mode: AuthMode, role: Role) =>
  mode === "login" ? "/api/auth/login" : `/api/auth/register/${role.toLowerCase()}`;

export function AuthForm({ role, mode }: { role: Role; mode: AuthMode }) {
  const [values, setValues] = useState<{ username: string; password: string; blockId: string }>({
    username: "", password: "", blockId: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  // Register faculty/admin pick an existing faculty name; student picks a block.
  useEffect(() => {
    if (mode !== "register") return;
    let cancelled = false;
    if (role === "STUDENT") {
      apiFetch<{ id: number; name: string }[]>("/api/crud/blocks")
        .catch(() => mockBlocks.map((b) => ({ id: b.id, name: b.name })))
        .then((rows) => { if (!cancelled) setOptions(rows.map((b) => ({ value: b.name, label: b.name }))); });
    } else {
      apiFetch<{ id: number; name: string }[]>("/api/crud/faculty")
        .catch(() => mockFaculty.map((f) => ({ id: f.id, name: f.name })))
        .then((rows) => { if (!cancelled) setOptions(rows.map((f) => ({ value: f.name, label: f.name }))); });
    }
    return () => { cancelled = true; };
  }, [mode, role]);

  function set<K extends keyof typeof values>(key: K, v: string) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    setFieldErrors({});
    const payload =
      mode === "login"
        ? { role, username: values.username, password: values.password }
        : role === "STUDENT"
          ? { name: values.username, block: values.blockId, password: values.password } // contract: block = block NAME
          : { name: values.username, password: values.password };
    try {
      await apiFetch(endpoint(mode, role), { method: "POST", body: JSON.stringify(payload) });
      window.location.assign(dashboard[role]); // hard nav so middleware sees the new session
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setFieldErrors(err.fields);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  }

  const needsExistingName = mode === "register" && role !== "STUDENT";

  return (
    <div className="w-full max-w-sm rounded-lg border border-border border-t-4 border-t-rsu bg-surface p-6 shadow-[0_4px_14px_rgba(21,36,31,0.18)]">
      <h1 className="text-xl font-semibold tracking-tight text-text">
        {mode === "login" ? `${roleLabel[role]} sign in` : `Register as ${roleLabel[role]}`}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login"
          ? `Enter your ${roleLabel[role].toLowerCase()} credentials to continue.`
          : role === "STUDENT"
            ? "Your name must already be on the class roster (FR-004)."
            : role === "FACULTY"
              ? "Set a password for your existing faculty record (FR-005)."
              : "Admin accounts are capped at 3; the name must exist in faculty records (FR-006)."}
      </p>

      {formError && <Notice variant="error" className="mt-4">{formError}</Notice>}

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
        <Field
          label={needsExistingName ? "Faculty name" : role === "STUDENT" && mode === "register" ? "Full name" : "Username"}
          error={fieldErrors.name ?? fieldErrors.username}
          required
        >
          {({ id, describedBy, invalid }) =>
            needsExistingName ? (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.username} invalid={invalid} onChange={(e) => set("username", e.target.value)}>
                <option value="" disabled>Select your name…</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            ) : (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.username} invalid={invalid}
                autoComplete="username" placeholder={mode === "login" ? "Your username" : "Juan Dela Cruz"}
                onChange={(e) => set("username", e.target.value)} />
            )
          }
        </Field>

        {mode === "register" && role === "STUDENT" && (
          <Field label="Block" error={fieldErrors.blockId ?? fieldErrors.block} required>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.blockId} invalid={invalid} onChange={(e) => set("blockId", e.target.value)}>
                <option value="" disabled>Select your block…</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            )}
          </Field>
        )}

        <Field label="Password" error={fieldErrors.password} hint={mode === "register" ? "Minimum 6 characters." : undefined} required>
          {({ id, describedBy, invalid }) => (
            <PasswordInput id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.password} invalid={invalid}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••" onChange={(e) => set("password", e.target.value)} />
          )}
        </Field>

        <Button type="submit" loading={busy} className="mt-1 w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-1.5 text-sm">
        {mode === "login" ? (
          <Link href={`/register/${role.toLowerCase()}`} className="rounded-sm text-accent transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Need an account? Register
          </Link>
        ) : (
          <Link href={`/login/${role.toLowerCase()}`} className="rounded-sm text-accent transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Already registered? Sign in
          </Link>
        )}
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-sm text-muted transition-colors duration-200 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to role selection
        </Link>
      </div>
    </div>
  );
}

