"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { Notice, EmptyState, SkeletonRows } from "@/components/notice";
import { TableShell, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import type { BlockDTO } from "@/lib/types";
import { ApiError, apiFetch } from "@/components/api-client";

/* Blocks module — year-level accordion (mirrors the Utilization room view):
 * each year level renders as a collapsed summary card; clicking it expands to
 * the blocks of that year (block, advisor) with edit/delete actions, plus an
 * "Add block" that prefills the year level. CRUD goes through the frozen
 * /api/crud/blocks contract. Advisor is nullable in the API contract — an
 * empty selection omits advisorId from the payload instead of sending "".
 * Server pages pass only serializable props. */

type Opt = { value: string; label: string };
type FormValues = Record<string, string>;

function yearSortKey(year: string): number {
  const n = parseInt(year, 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

function yearLabel(year: string): string {
  const n = parseInt(year, 10);
  return Number.isNaN(n) ? year : `Year ${n}`;
}

export function BlocksManager({
  initialRows,
  initialDegraded,
  facultyOptions,
}: {
  initialRows: BlockDTO[];
  initialDegraded: boolean;
  facultyOptions: Opt[];
}) {
  const [rows, setRows] = useState<BlockDTO[]>(initialRows);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [creatingYear, setCreatingYear] = useState<string | null>(null); // null = dialog closed
  const [editing, setEditing] = useState<BlockDTO | null>(null);
  const [deleting, setDeleting] = useState<BlockDTO | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await apiFetch<BlockDTO[]>("/api/crud/blocks");
      if (mountedRef.current) { setRows(data); setDegraded(false); }
    } catch (err) {
      if (mountedRef.current) {
        setListError(err instanceof ApiError ? err.message : "Could not load data.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, BlockDTO[]>();
    for (const b of rows) {
      const list = map.get(b.yearLevel) ?? [];
      list.push(b);
      map.set(b.yearLevel, list);
    }
    return Array.from(map.entries())
      .map(([year, blocks]) => ({
        year,
        label: yearLabel(year),
        blocks: blocks.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => yearSortKey(a.year) - yearSortKey(b.year) || a.year.localeCompare(b.year));
  }, [rows]);

  const dialogOpen = creatingYear !== null || editing !== null;

  function toggle(year: string) {
    setExpanded((ys) => (ys.includes(year) ? ys.filter((y) => y !== year) : [...ys, year]));
  }

  function openCreate(year?: string) {
    setValues({ name: "", yearLevel: year ?? "", advisorId: "" });
    setFieldErrors({});
    setFormError(null);
    setCreatingYear(year ?? "");
    setEditing(null);
  }

  function openEdit(block: BlockDTO) {
    setValues({
      name: block.name,
      yearLevel: block.yearLevel,
      advisorId: block.advisorId === null ? "" : String(block.advisorId),
    });
    setFieldErrors({});
    setFormError(null);
    setEditing(block);
    setCreatingYear(null);
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      name: values.name ?? "",
      yearLevel: values.yearLevel ?? "",
    };
    // advisorId is nullable in the contract — omit it when no advisor is chosen
    if (values.advisorId !== "") payload.advisorId = Number(values.advisorId);
    return payload;
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      if (editing) {
        await apiFetch("/api/crud/blocks", { method: "PUT", body: JSON.stringify({ ...payload, id: editing.id }) });
      } else {
        await apiFetch("/api/crud/blocks", { method: "POST", body: JSON.stringify(payload) });
      }
      setCreatingYear(null);
      setEditing(null);
      await reload();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fields) setFieldErrors(err.fields);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await apiFetch(`/api/crud/blocks?id=${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Delete failed.");
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text">Blocks</h1>
          <p className="mt-0.5 text-sm text-muted">
            Class blocks grouped by year level · click a year to see its blocks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" onClick={reload} aria-label="Refresh list" className="px-2.5">
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button size="md" onClick={() => openCreate()}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Add block
          </Button>
        </div>
      </div>

      {degraded && (
        <Notice variant="muted" title="Sample data">
          The backend API is not reachable yet, so a sample list is shown. Create, edit and delete
          will report errors until the API is live — use Refresh once it is.
        </Notice>
      )}
      {listError && (
        <Notice variant="error" title="Could not load the list">
          {listError}{" "}
          <button type="button" onClick={reload} className="font-medium underline underline-offset-2">
            Retry
          </button>
        </Notice>
      )}

      {groups.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            title="No blocks yet"
            description="Add the first block to get started."
            icon={Plus}
            action={<Button size="sm" onClick={() => openCreate()}><Plus aria-hidden="true" className="h-4 w-4" /> Add block</Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => {
            const open = expanded.includes(group.year);
            return (
              <div key={group.year} className="rounded-lg border border-border bg-surface">
                <button
                  type="button"
                  onClick={() => toggle(group.year)}
                  aria-expanded={open}
                  aria-controls={`blocks-year-${group.year}`}
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                    <span className="flex flex-col leading-tight">
                      <span className="text-base font-semibold tracking-tight text-text">{group.label}</span>
                      <span className="text-sm text-muted">
                        {group.blocks.length === 0
                          ? "No blocks in this year yet"
                          : `${group.blocks.length} block${group.blocks.length === 1 ? "" : "s"} · click to view`}
                      </span>
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openCreate(group.year); }}
                    >
                      <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                      Add in {group.label}
                    </Button>
                  </span>
                </button>
                {open && (
                  <div id={`blocks-year-${group.year}`} className="px-4 pb-4 sm:px-5">
                    {group.blocks.length === 0 ? (
                      <EmptyState
                        title={`No blocks in ${group.label}`}
                        description="Add the first block for this year level."
                        icon={Plus}
                        action={<Button size="sm" onClick={() => openCreate(group.year)}><Plus aria-hidden="true" className="h-4 w-4" /> Add block</Button>}
                      />
                    ) : (
                      <TableShell>
                        <THead>
                          <TR>
                            <TH>Block</TH>
                            <TH>Advisor</TH>
                            <TH className="text-right">Actions</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {group.blocks.map((block) => (
                            <TR key={block.id}>
                              <TD className="font-medium">{block.name}</TD>
                              <TD className="text-muted">{block.advisorName ?? "—"}</TD>
                              <TD className="text-right">
                                <span className="inline-flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEdit(block)} aria-label={`Edit ${block.name}`}>
                                    <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setDeleting(block)} aria-label={`Delete ${block.name}`} className="hover:text-danger">
                                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                                  </Button>
                                </span>
                              </TD>
                            </TR>
                          ))}
                        </TBody>
                      </TableShell>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => { setCreatingYear(null); setEditing(null); }}
        title={editing ? "Edit block" : creatingYear ? `Add block in ${yearLabel(creatingYear)}` : "Add block"}
      >
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          {formError && <Notice variant="error">{formError}</Notice>}
          <Field label="Block name" error={fieldErrors.name} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.name ?? ""} invalid={invalid} placeholder="e.g., BEEd 3-A" onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
            )}
          </Field>
          <Field label="Year level" error={fieldErrors.yearLevel} required hint="Number (1–6) or a free label.">
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.yearLevel ?? ""} invalid={invalid} placeholder="e.g., 3" onChange={(e) => setValues((v) => ({ ...v, yearLevel: e.target.value }))} />
            )}
          </Field>
          <Field label="Advisor" error={fieldErrors.advisorId}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.advisorId ?? ""} invalid={invalid} onChange={(e) => setValues((v) => ({ ...v, advisorId: e.target.value }))}>
                <option value="">No advisor</option>
                {facultyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => { setCreatingYear(null); setEditing(null); }}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Create"}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleting?.name ?? "block"}?`}
        message="This permanently removes the block. Related schedules may be affected — the server will refuse deletes that would break references."
        loading={removing}
      />
    </section>
  );
}

