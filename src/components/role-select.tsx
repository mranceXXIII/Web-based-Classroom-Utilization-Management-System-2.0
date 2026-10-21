"use client";

import { useState } from "react";

/* index.php port — the exact PHP flow: pick a role radio, press Submit,
 * land on that role's login page (redirect.php → *Login.php). Radios carry
 * the PHP's green accent; the submit button matches the PHP hover behavior. */
const OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "faculty", label: "Faculty" },
  { value: "student", label: "Student" },
] as const;

export function RoleSelectForm() {
  const [option, setOption] = useState<string>("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (option) window.location.assign(`/login/${option}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col" noValidate={false}>
      <h2 className="mt-0 text-center text-lg font-semibold text-rsu-deep">
        Select an option
      </h2>
      <div className="mx-auto mt-3 flex w-fit flex-col gap-2.5 text-left">
        {OPTIONS.map(({ value, label }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2.5 text-base text-text">
            <input
              type="radio"
              name="option"
              value={value}
              checked={option === value}
              onChange={(e) => setOption(e.target.value)}
              required
              className="h-4 w-4 accent-rsu"
            />
            {label}
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={!option}
        className="mx-auto mt-5 rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-contrast transition-colors duration-200 hover:bg-rsu-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit
      </button>
    </form>
  );
}
