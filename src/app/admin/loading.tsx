import { SkeletonRows } from "@/components/notice";

export default function AdminLoading() {
  return (
    <section className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-40 animate-pulse rounded-md bg-surface-2" />
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <SkeletonRows rows={5} />
      </div>
    </section>
  );
}
