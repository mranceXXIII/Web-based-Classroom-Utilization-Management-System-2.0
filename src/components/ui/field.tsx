import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/* Uniform form controls (FR-030). Every control renders inside Field, which
 * guarantees a visible label bound via htmlFor (app-interface.md #2) plus an
 * inline error slot with aria wiring. */

export interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}

export function Field({ label, error, hint, required, children }: FieldProps) {
  const autoId = useId();
  const id = `f-${autoId}`;
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && <span aria-hidden="true" className="text-danger"> *</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">{hint}</p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  );
}

const controlBase =
  "h-9 w-full rounded-md border bg-surface px-3 text-sm text-text placeholder:text-muted/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent disabled:opacity-50 read-only:text-muted";

const controlState = (invalid: boolean) =>
  invalid ? "border-danger focus:ring-danger" : "border-border";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; className?: string }>(
  function Input({ invalid = false, className = "", ...rest }, ref) {
    return <input ref={ref} className={[controlBase, controlState(invalid), className].join(" ")} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; className?: string }>(
  function Select({ invalid = false, className = "", children, ...rest }, ref) {
    return (
      <select ref={ref} className={[controlBase, controlState(invalid), "appearance-none pr-8", className].join(" ")} {...rest}>
        {children}
      </select>
    );
  },
);

/** Password input with accessible show/hide toggle (app-interface.md #19). */
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function PasswordInput({ invalid = false, ...rest }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={show ? "text" : "password"}
          className={[controlBase, controlState(invalid), "pr-10"].join(" ")}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex h-9 w-10 items-center justify-center text-muted transition-colors duration-200 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          {show ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
