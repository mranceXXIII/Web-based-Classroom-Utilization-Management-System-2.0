"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { Notice, EmptyState, SkeletonRows } from "@/components/notice";
import { TableShell, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { DAY_CODES, DAY_LABELS } from "@/components/mocks";
import type { DayCode } from "@/lib/types";
import { ApiError, apiFetch } from "@/components/api-client";

/* EntityManager — one uniform CRUD surface for faculty, blocks, subjects,
 * rooms, schedules (FR-012/013): list + create/edit dialog + delete confirm,
 * all through the frozen /api/crud/{entity} contract (GET/POST/PUT/DELETE).
 * Initial rows come from the server data layer (mock fallback, `degraded`
 * flag shown truthfully); Refresh pulls live data; mutations hit the real API. */

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "select" | "time" | "days";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface EntityManagerProps<T extends { id: number }> {
  entity: string;
  title: string;
  description?: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  /** row → initial form values (all string values; days joined with commas) */
  toForm: (row: T) => Record<string, string>;
  /** keys that must be sent as numbers in the payload */
  numericKeys?: string[];
  createDefaults?: Record<string, string>;
  initialRows: T[];
  initialDegraded: boolean;
  headerExtra?: React.ReactNode;
}

type FormValues = Record<string, string>;

export function EntityManager<T extends { id: number }>({
  entity, title, description, columns, fields, toForm, numericKeys = [],
  createDefaults = {}, initialRows, initialDegraded, headerExtra,
}: EntityManagerProps<T>) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
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
      const data = await apiFetch<T[]>(`/api/crud/${entity}`);
      if (mountedRef.current) { setRows(data); setDegraded(false); }
    } catch (err) {
      if (mountedRef.current) {
        setListError(err instanceof ApiError ? err.message : "Could not load data.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [entity]);

  function openCreate() {
    setValues({ ...createDefaults });
    setFieldErrors({});
    setFormError(null);
    setCreating(true);
  }

  function openEdit(row: T) {
    setValues({ ...toForm(row) });
    setFieldErrors({});
    setFormError(null);
    setEditing(row);
  }

  function buildPayload(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = values[f.key] ?? "";
      if (f.type === "days") {
        out[f.key] = raw.split(",").filter(Boolean); // wire format: DayCode[]
      } else if (numericKeys.includes(f.key)) {
        out[f.key] = raw === "" ? "" : Number(raw);
      } else {
        out[f.key] = raw;
      }
    }
    return out;
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = buildPayload();
      if (editing) {
        await apiFetch(`/api/crud/${entity}`, { method: "PUT", body: JSON.stringify({ ...payload, id: editing.id }) });
      } else {
        await apiFetch(`/api/crud/${entity}`, { method: "POST", body: JSON.stringify(payload) });
      }
      setCreating(false);
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
      await apiFetch(`/api/crud/${entity}?id=${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Delete failed.");
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  }

  const dialogOpen = creating || editing !== null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <Button variant="ghost" size="md" onClick={reload} aria-label="Refresh list" className="px-2.5">
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button size="md" onClick={openCreate}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Add
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

      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="px-4 py-3 sm:px-5"><SkeletonRows /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            description="Add the first entry to get started."
            icon={Plus}
            action={<Button size="sm" onClick={openCreate}><Plus aria-hidden="true" className="h-4 w-4" /> Add</Button>}
          />
        ) : (
          <TableShell>
            <THead>
              <TR>
                {columns.map((c) => <TH key={c.key}>{c.header}</TH>)}
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  {columns.map((c) => (
                    <TD key={c.key}>{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}</TD>
                  ))}
                  <TD className="text-right">
                    <span className="inline-flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label={`Edit ${title} row`}>
                        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(row)} aria-label={`Delete ${title} row`} className="hover:text-danger">
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

      <Dialog
        open={dialogOpen}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? `Edit ${title.toLowerCase().replace(/s$/, "")}` : `Add ${title.toLowerCase().replace(/s$/, "")}`}
      >
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          {formError && <Notice variant="error">{formError}</Notice>}
          {fields.map((f) => (
            <Field key={f.key} label={f.label} error={fieldErrors[f.key]} required={f.required}>
              {({ id, describedBy, invalid }) =>
                f.type === "select" ? (
                  <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values[f.key] ?? ""} invalid={invalid} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}>
                    <option value="" disabled>Select…</option>
                    {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                ) : f.type === "time" ? (
                  <Input id={id} type="time" aria-describedby={describedBy} aria-invalid={invalid} value={values[f.key] ?? ""} invalid={invalid} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                ) : f.type === "days" ? (
                  <div role="group" aria-label={f.label} className="flex flex-wrap gap-1.5">
                    {DAY_CODES.map((d) => {
                      const selected = (values[f.key] ?? "").split(",").filter(Boolean).includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            const cur = (values[f.key] ?? "").split(",").filter(Boolean);
                            const next = selected ? cur.filter((x) => x !== d) : [...cur, d];
                            setValues((v) => ({ ...v, [f.key]: DAY_CODES.filter((x) => next.includes(x)).join(",") }));
                          }}
                          className={`h-8 rounded-md border px-3 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            selected ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-text"
                          }`}
                        >
                          {DAY_LABELS[d]}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values[f.key] ?? ""} invalid={invalid} placeholder={f.placeholder} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                )
              }
            </Field>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Create"}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={`Delete ${title.toLowerCase().replace(/s$/, "")}?`}
        message="This permanently removes the record. Related schedules may be affected — the server will refuse deletes that would break references."
        loading={removing}
      />
    </section>
  );
}

