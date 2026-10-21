"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { Notice, EmptyState, SkeletonRows } from "@/components/notice";
import { TableShell, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { Badge, DayDots } from "@/components/ui/badge";
import { DAY_CODES, DAY_LABELS, SEMESTERS } from "@/components/mocks";
import { ExportSchedulesButton } from "@/components/admin/export-button";
import type { BlockDTO, DayCode, FacultyDTO, RoomDTO, ScheduleDTO, SubjectDTO } from "@/lib/types";
import { ApiError, apiFetch } from "@/components/api-client";

/* EntityManager — one uniform CRUD surface for faculty, blocks, subjects,
 * rooms, schedules (FR-012/013): list + create/edit dialog + delete confirm,
 * all through the frozen /api/crud/{entity} contract (GET/POST/PUT/DELETE).
 * Initial rows come from the server data layer (mock fallback, `degraded`
 * flag shown truthfully); Refresh pulls live data; mutations hit the real API.
 *
 * RSC NOTE (post-ship fix): the per-entity column/field/toForm configuration
 * lives IN THIS CLIENT COMPONENT, keyed by `entity` — server pages pass only
 * serializable props (entity, title, initial rows). Functions (render, toForm)
 * cannot cross the server→client boundary; defining them here is what makes
 * the entity sections render at all. Select options for schedules are passed
 * as plain {value,label} arrays via `selectOptions`. */

export type EntityName = "faculty" | "blocks" | "subjects" | "rooms" | "schedules";

type Opt = { value: string; label: string };

/** Serializable option lists for select fields (schedules page). Fields are
 * optional — each entity consumes only the lists it needs. */
export interface SelectOptions {
  blocks?: Opt[];
  subjects?: Opt[];
  rooms?: Opt[];
  faculty?: Opt[];
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "select" | "time" | "days";
  required?: boolean;
  placeholder?: string;
  options?: Opt[];
}

type EntityRow = FacultyDTO | BlockDTO | SubjectDTO | RoomDTO | ScheduleDTO;
type FormValues = Record<string, string>;

interface ColumnDef {
  key: string;
  header: string;
  render?: (row: EntityRow) => React.ReactNode;
}

interface EntityConfig {
  columns: ColumnDef[];
  fields: FieldDef[];
  toForm: (row: EntityRow) => FormValues;
  numericKeys: string[];
  createDefaults: Record<string, string>;
  /** Grid-view card body (List ⇄ Grid toggle). */
  card: (row: EntityRow) => React.ReactNode;
}

function buildConfig(entity: EntityName, opts: SelectOptions | undefined): EntityConfig {
  switch (entity) {
    case "faculty":
      return {
        columns: [
          { key: "name", header: "Name", render: (r) => <span className="font-medium">{(r as FacultyDTO).name}</span> },
          { key: "academicRank", header: "Academic Rank" },
          { key: "advisory", header: "Advisory" },
          {
            key: "hasAccount",
            header: "Account",
            render: (r) => {
              const f = r as FacultyDTO;
              return <Badge variant={f.hasAccount ? "success" : "muted"}>{f.hasAccount ? "Registered" : "No account"}</Badge>;
            },
          },
          {
            key: "lastHeartbeat",
            header: "Last heartbeat",
            render: (r) => {
              const hb = (r as FacultyDTO).lastHeartbeat;
              return hb ? new Date(hb).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "—";
            },
          },
        ],
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "academicRank", label: "Academic rank", type: "text", required: true },
          { key: "advisory", label: "Advisory", type: "text", placeholder: "Block name or —" },
        ],
        toForm: (r) => {
          const f = r as FacultyDTO;
          return { name: f.name, academicRank: f.academicRank, advisory: f.advisory };
        },
        card: (r) => {
          const f = r as FacultyDTO;
          return (
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-text">{f.name}</span>
                <Badge variant={f.hasAccount ? "success" : "muted"}>{f.hasAccount ? "Registered" : "No account"}</Badge>
              </span>
              <span className="text-sm text-muted">Academic rank: {f.academicRank}</span>
              <span className="text-sm text-muted">Advisory: {f.advisory}</span>
              <span className="text-sm text-muted">
                Last heartbeat:{" "}
                {f.lastHeartbeat
                  ? new Date(f.lastHeartbeat).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </span>
            </div>
          );
        },
        numericKeys: [],
        createDefaults: {},
      };

    case "blocks":
      return {
        columns: [
          { key: "name", header: "Block", render: (r) => <span className="font-medium">{(r as BlockDTO).name}</span> },
          { key: "yearLevel", header: "Year level" },
          { key: "advisorName", header: "Advisor", render: (r) => (r as BlockDTO).advisorName ?? "—" },
        ],
        fields: [
          { key: "name", label: "Block name", type: "text", required: true, placeholder: "e.g., BEEd 3-A" },
          { key: "yearLevel", label: "Year level", type: "text", required: true, placeholder: "1–6" },
          { key: "advisorId", label: "Advisor", type: "select", required: true, options: opts?.faculty ?? [] },
        ],
        toForm: (r) => {
          const b = r as BlockDTO;
          return { name: b.name, yearLevel: b.yearLevel, advisorId: b.advisorId === null ? "" : String(b.advisorId) };
        },
        card: (r) => {
          const b = r as BlockDTO;
          return (
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-semibold text-text">{b.name}</span>
              <span className="text-sm text-muted">Year level: {b.yearLevel}</span>
              <span className="text-sm text-muted">Advisor: {b.advisorName ?? "—"}</span>
              <span className="text-sm text-muted">Department: {b.departmentName ?? "—"}</span>
            </div>
          );
        },
        numericKeys: ["advisorId"],
        createDefaults: {},
      };

    case "subjects":
      return {
        columns: [
          { key: "description", header: "Description", render: (r) => <span className="font-medium">{(r as SubjectDTO).description}</span> },
        ],
        fields: [
          { key: "description", label: "Subject description", type: "text", required: true, placeholder: "e.g., Assessment in Learning 1" },
        ],
        toForm: (r) => ({ description: (r as SubjectDTO).description }),
        card: (r) => (
          <span className="text-base font-medium text-text">{(r as SubjectDTO).description}</span>
        ),
        numericKeys: [],
        createDefaults: {},
      };

    case "rooms":
      return {
        columns: [
          { key: "name", header: "Room", render: (r) => <span className="font-medium">{(r as RoomDTO).name}</span> },
        ],
        fields: [
          { key: "name", label: "Room name", type: "text", required: true, placeholder: "e.g., 201" },
        ],
        toForm: (r) => ({ name: (r as RoomDTO).name }),
        card: (r) => (
          <span className="text-base font-semibold text-text">Room {(r as RoomDTO).name}</span>
        ),
        numericKeys: [],
        createDefaults: {},
      };

    case "schedules":
      return {
        columns: [
          { key: "subjectDescription", header: "Subject", render: (r) => <span className="font-medium">{(r as ScheduleDTO).subjectDescription}</span> },
          { key: "blockName", header: "Block", render: (r) => <span className="text-muted">{(r as ScheduleDTO).blockName}</span> },
          { key: "facultyName", header: "Faculty", render: (r) => <span className="text-muted">{(r as ScheduleDTO).facultyName}</span> },
          { key: "roomName", header: "Room", render: (r) => <span className="tabular-nums">{(r as ScheduleDTO).roomName}</span> },
          { key: "time", header: "Time", render: (r) => { const s = r as ScheduleDTO; return <span className="tabular-nums text-muted">{s.startTime}–{s.endTime}</span>; } },
          { key: "days", header: "Days", render: (r) => <DayDots days={(r as ScheduleDTO).days as DayCode[]} /> },
          { key: "semester", header: "Semester", render: (r) => <span className="text-muted">{(r as ScheduleDTO).semester}</span> },
        ],
        fields: [
          { key: "blockId", label: "Block", type: "select", required: true, options: opts?.blocks ?? [] },
          { key: "subjectId", label: "Subject", type: "select", required: true, options: opts?.subjects ?? [] },
          { key: "roomId", label: "Room", type: "select", required: true, options: opts?.rooms ?? [] },
          { key: "facultyId", label: "Faculty", type: "select", options: [{ value: "0", label: "None (no faculty)" }, ...(opts?.faculty ?? [])] },
          { key: "semester", label: "Semester", type: "select", required: true, options: SEMESTERS.map((s) => ({ value: s, label: s })) },
          { key: "startTime", label: "Start time", type: "time", required: true },
          { key: "endTime", label: "End time", type: "time", required: true },
          { key: "days", label: "Days", type: "days", required: true },
        ],
        toForm: (r) => {
          const s = r as ScheduleDTO;
          return {
            blockId: String(s.blockId),
            subjectId: String(s.subjectId),
            roomId: String(s.roomId),
            facultyId: String(s.facultyId), // 0 = "None" sentinel (API-CONTRACT.md)
            semester: s.semester,
            startTime: s.startTime.slice(0, 5),
            endTime: s.endTime.slice(0, 5),
            days: s.days.join(","),
          };
        },
        card: (r) => {
          const s = r as ScheduleDTO;
          return (
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-semibold text-text">{s.subjectDescription}</span>
              <span className="text-sm text-muted">Block: {s.blockName}</span>
              <span className="text-sm text-muted">
                Faculty: {s.facultyId === 0 ? <span className="italic">None</span> : s.facultyName}
              </span>
              <span className="text-sm text-muted">Room: {s.roomName}</span>
              <span className="text-sm tabular-nums text-muted">{s.startTime}–{s.endTime}</span>
              <span className="flex flex-wrap items-center gap-1.5">
                <DayDots days={s.days as DayCode[]} />
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">{s.semester}</span>
              </span>
            </div>
          );
        },
        numericKeys: ["blockId", "subjectId", "roomId", "facultyId"],
        createDefaults: { semester: "1st Sem" },
      };
  }
}

export interface EntityManagerProps {
  entity: EntityName;
  title: string;
  description?: string;
  initialRows: EntityRow[];
  initialDegraded: boolean;
  /** schedules only: option lists for the block/subject/room/faculty selects */
  selectOptions?: SelectOptions;
}

export function EntityManager({
  entity, title, description, initialRows, initialDegraded, selectOptions,
}: EntityManagerProps) {
  const cfg = buildConfig(entity, selectOptions);
  const [rows, setRows] = useState<EntityRow[]>(initialRows);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<EntityRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EntityRow | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await apiFetch<EntityRow[]>(`/api/crud/${entity}`);
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
    setValues({ ...cfg.createDefaults });
    setFieldErrors({});
    setFormError(null);
    setCreating(true);
  }

  function openEdit(row: EntityRow) {
    setValues({ ...cfg.toForm(row) });
    setFieldErrors({});
    setFormError(null);
    setEditing(row);
  }

  function buildPayload(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of cfg.fields) {
      const raw = values[f.key] ?? "";
      if (f.type === "days") {
        out[f.key] = raw.split(",").filter(Boolean); // wire format: DayCode[]
      } else if (cfg.numericKeys.includes(f.key)) {
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
          <ViewToggle view={view} onChange={setView} />
          {entity === "schedules" && <ExportSchedulesButton />}
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

      {loading ? (
        <div className="rounded-lg border border-border bg-surface px-4 py-3 sm:px-5"><SkeletonRows /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            description="Add the first entry to get started."
            icon={Plus}
            action={<Button size="sm" onClick={openCreate}><Plus aria-hidden="true" className="h-4 w-4" /> Add</Button>}
          />
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
              <div className="flex-1">{cfg.card(row)}</div>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label={`Edit ${title} entry`}>
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(row)} aria-label={`Delete ${title} entry`} className="hover:text-danger">
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
                {cfg.columns.map((c) => <TH key={c.key}>{c.header}</TH>)}
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  {cfg.columns.map((c) => (
                    <TD key={c.key}>{c.render ? c.render(row) : String((row as unknown as Record<string, unknown>)[c.key] ?? "—")}</TD>
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
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? `Edit ${title.toLowerCase().replace(/s$/, "")}` : `Add ${title.toLowerCase().replace(/s$/, "")}`}
      >
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          {formError && <Notice variant="error">{formError}</Notice>}
          {cfg.fields.map((f) => (
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

