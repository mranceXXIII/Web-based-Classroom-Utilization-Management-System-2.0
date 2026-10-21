/* Uniform table (FR-030/FR-034): header style, row hover, zebra-free minimal
 * surface; TableShell scrolls horizontally below ~640px instead of breaking layout.
 * `id` is optional and used by the admin List module's CSV exporter, which looks
 * the rendered <table> up by element id (same mechanism as the legacy PHP). */
export function TableShell({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table id={id} className="w-full min-w-[560px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border bg-surface-2/60">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={`transition-colors duration-200 hover:bg-surface-2/50 ${className}`}>{children}</tr>;
}

export function TH({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted sm:px-4 ${className}`}>
      {children}
    </th>
  );
}

export function TD({ children, className = "", colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-3 py-2.5 align-middle text-text sm:px-4 ${className}`}>{children}</td>;
}
