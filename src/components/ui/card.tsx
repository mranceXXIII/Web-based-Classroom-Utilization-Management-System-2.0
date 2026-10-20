/* Uniform card (FR-030): one surface shape, consistent padding + radius. */
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex flex-col gap-1 border-b border-border px-4 py-3 sm:px-5 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={`text-base font-semibold tracking-tight text-text ${className}`}>{children}</h2>;
}

export function CardDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm text-muted ${className}`}>{children}</p>;
}

export function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-4 py-4 sm:px-5 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex items-center gap-2 border-t border-border px-4 py-3 sm:px-5 ${className}`}>{children}</div>;
}
