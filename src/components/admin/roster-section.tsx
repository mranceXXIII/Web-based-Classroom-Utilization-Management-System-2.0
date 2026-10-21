"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Notice, EmptyState, SkeletonRows } from "@/components/notice";
import { TableShell, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ApiError, apiFetch } from "@/components/api-client";
import type { RosterEntryDTO } from "@/lib/types";

/* FR-014 — roster section: CSV import (multipart → /api/import/roster) + list.
 * Same design language and states as EntityManager. */

export function RosterSection({ initialRows, initialDegraded }: {
  initialRows: RosterEntryDTO[];
  initialDegraded: boolean;
}) {
  const [rows, setRows] = useState<RosterEntryDTO[]>(initialRows);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<RosterEntryDTO | null>(null);
  const [removing, setRemoving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const fileRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await apiFetch<RosterEntryDTO[]>("/api/crud/roster");
      if (mountedRef.current) { setRows(data); setDegraded(false); }
    } catch (err) {
      if (mountedRef.current) setListError(err instanceof ApiError ? err.message : "Could not load the roster.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  async function importCsv() {
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportOk(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const result = await apiFetch<{ created: number; updated: number; skipped: number; errors: string[] }>(
        "/api/import/roster",
        { method: "POST", body: fd },
      );
      const parts = [`Imported: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`];
      if (result.errors.length > 0) parts.push(`Row errors: ${result.errors.join(" · ")}`);
      setImportOk(parts.join(" "));
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await reload();
    } catch (err) {
      setImportError(err instanceof ApiError ? err.message : "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await apiFetch(`/api/crud/roster?id=${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await reload();
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "Delete failed.");
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text">Roster</h1>
          <p className="mt-0.5 text-sm text-muted">Official student list — import via CSV (columns: name, block).</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <Button variant="ghost" onClick={reload} aria-label="Refresh roster" className="px-2.5">
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <p className="text-sm font-medium text-text">Import CSV</p>
        <p className="mt-0.5 text-sm text-muted">Expected header row: <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">name,block</code></p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            aria-label="CSV file to import"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImportOk(null); setImportError(null); }}
            className="h-9 max-w-full text-sm text-muted file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:text-sm file:font-medium file:text-text hover:file:bg-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={importCsv} disabled={!file} loading={importing}>
            <Upload aria-hidden="true" className="h-4 w-4" /> Import
          </Button>
        </div>
        {importOk && (
          <Notice variant="success" className="mt-3">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />{importOk}</span>
          </Notice>
        )}
        {importError && <Notice variant="error" className="mt-3">{importError}</Notice>}
      </div>

      {degraded && (
        <Notice variant="muted" title="Sample data">
          The backend API is not reachable yet, so a sample roster is shown. Use Refresh once it is live.
        </Notice>
      )}
      {listError && (
        <Notice variant="error" title="Could not load the roster">
          {listError}{" "}
          <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Retry</button>
        </Notice>
      )}

      {loading ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-3 sm:px-5"><SkeletonRows /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            title="Roster is empty"
            description="Import a CSV file with name and block columns."
            icon={Upload}
          />
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
              <div className="flex-1">
                <span className="block text-base font-semibold text-text">{r.name}</span>
                <span className="block text-sm text-muted">Block: {r.blockName ?? "—"}</span>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} aria-label={`Delete roster entry ${r.name}`} className="hover:text-danger">
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface">
          <TableShell>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Block</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD className="font-medium">{r.name}</TD>
                  <TD className="text-muted">{r.blockName}</TD>
                  <TD className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} aria-label={`Delete roster entry ${r.name}`} className="hover:text-danger">
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableShell>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete roster entry?"
        message={`This removes ${deleting?.name ?? "this entry"} from the official roster. Registered students keep their accounts.`}
        loading={removing}
      />
    </section>
  );
}
