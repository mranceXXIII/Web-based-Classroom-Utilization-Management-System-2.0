"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Building2, ChevronDown, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { Notice, EmptyState, SkeletonRows } from "@/components/notice";
import { TableShell, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import type { BlockDTO, DepartmentDTO } from "@/lib/types";
import { ApiError, apiFetch } from "@/components/api-client";

/* Blocks module — Department → Year level → Blocks, all as collapsible cards
 * (same pattern as the Utilization room view): click a department to see its
 * year levels, click a year level to see its blocks. "Add department" creates
 * a new department; "Add block" only offers departments that already exist
 * (select), prefilled when opened inside a department/year. CRUD goes through
 * the frozen /api/crud/blocks and /api/crud/departments contracts. Advisor and
 * department are nullable in the contracts — empty selects omit the id from
 * the payload instead of sending "". Server pages pass only serializable props. */

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

interface YearGroup {
  year: string;
  label: string;
  blocks: BlockDTO[];
}

interface DepartmentGroup {
  department: DepartmentDTO;
  years: YearGroup[];
  blockCount: number;
}

/** Uniform block table — shared by the list accordions and the grid drill-down. */
function BlockTable({ blocks, onEdit, onDelete }: {
  blocks: BlockDTO[];
  onEdit: (block: BlockDTO) => void;
  onDelete: (block: BlockDTO) => void;
}) {
  return (
    <TableShell>
      <THead>
        <TR>
          <TH>Block</TH>
          <TH>Advisor</TH>
          <TH className="text-right">Actions</TH>
        </TR>
      </THead>
      <TBody>
        {blocks.map((block) => (
          <TR key={block.id}>
            <TD className="font-medium">{block.name}</TD>
            <TD className="text-muted">{block.advisorName ?? "—"}</TD>
            <TD className="text-right">
              <span className="inline-flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(block)} aria-label={`Edit ${block.name}`}>
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(block)} aria-label={`Delete ${block.name}`} className="hover:text-danger">
                  <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
              </span>
            </TD>
          </TR>
        ))}
      </TBody>
    </TableShell>
  );
}

export function BlocksManager({
  initialRows,
  initialDegraded,
  initialDepartments,
  facultyOptions,
}: {
  initialRows: BlockDTO[];
  initialDegraded: boolean;
  initialDepartments: DepartmentDTO[];
  facultyOptions: Opt[];
}) {
  const [rows, setRows] = useState<BlockDTO[]>(initialRows);
  const [departments, setDepartments] = useState<DepartmentDTO[]>(initialDepartments);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDepts, setOpenDepts] = useState<number[]>([]);
  const [openYears, setOpenYears] = useState<string[]>([]); // `${deptId}--${year}`
  const [creatingYear, setCreatingYear] = useState<string | null>(null); // null = block dialog closed
  const [creatingDept, setCreatingDept] = useState(false);
  const [editing, setEditing] = useState<BlockDTO | null>(null);
  const [deleting, setDeleting] = useState<BlockDTO | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [deptName, setDeptName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingDept, setSavingDept] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const [blocks, depts] = await Promise.all([
        apiFetch<BlockDTO[]>("/api/crud/blocks"),
        apiFetch<DepartmentDTO[]>("/api/crud/departments"),
      ]);
      if (mountedRef.current) { setRows(blocks); setDepartments(depts); setDegraded(false); }
    } catch (err) {
      if (mountedRef.current) {
        setListError(err instanceof ApiError ? err.message : "Could not load data.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /* Grouping: departments (in their stored order) → year levels (numeric
   * year levels first, free-text labels after) → blocks (alphabetical). */
  const deptGroups = useMemo<DepartmentGroup[]>(() => {
    return departments.map((department) => {
      const deptBlocks = rows.filter((b) => b.departmentId === department.id);
      const yearMap = new Map<string, BlockDTO[]>();
      for (const b of deptBlocks) {
        const list = yearMap.get(b.yearLevel) ?? [];
        list.push(b);
        yearMap.set(b.yearLevel, list);
      }
      const years = Array.from(yearMap.entries())
        .map(([year, blocks]) => ({
          year,
          label: yearLabel(year),
          blocks: blocks.sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .sort((a, b) => yearSortKey(a.year) - yearSortKey(b.year) || a.year.localeCompare(b.year));
      return { department, years, blockCount: deptBlocks.length };
    });
  }, [departments, rows]);

  const selectedGroup = deptGroups.find((g) => g.department.id === selectedDeptId) ?? null;
  const selectedYearGroup = selectedGroup?.years.find((y) => y.year === selectedYear) ?? null;

  const dialogOpen = creatingYear !== null || editing !== null;

  function toggleDept(deptId: number) {
    setOpenDepts((ids) => (ids.includes(deptId) ? ids.filter((id) => id !== deptId) : [...ids, deptId]));
  }

  function toggleYear(key: string) {
    setOpenYears((ys) => (ys.includes(key) ? ys.filter((y) => y !== key) : [...ys, key]));
  }

  function openCreate(deptId?: number, year?: string) {
    const dept = deptId ?? (openDepts.length === 1 ? openDepts[0] : undefined);
    setValues({
      name: "",
      yearLevel: year ?? "",
      advisorId: "",
      departmentId: dept !== undefined ? String(dept) : "",
    });
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
      departmentId: block.departmentId === null ? "" : String(block.departmentId),
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
    // advisor/department are nullable in the contract — omit empty selections
    if (values.advisorId !== "") payload.advisorId = Number(values.advisorId);
    if (values.departmentId !== "") payload.departmentId = Number(values.departmentId);
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

  async function saveDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingDept(true);
    setDeptError(null);
    try {
      await apiFetch("/api/crud/departments", { method: "POST", body: JSON.stringify({ name: deptName }) });
      setCreatingDept(false);
      setDeptName("");
      await reload();
    } catch (err) {
      setDeptError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSavingDept(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-text">Blocks</h1>
          <p className="mt-0.5 text-sm text-muted">
            Departments → year levels → blocks · click a department to drill down.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <Button variant="ghost" size="md" onClick={reload} aria-label="Refresh list" className="px-2.5">
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="secondary" size="md" onClick={() => { setCreatingDept(true); setDeptName(""); setDeptError(null); }}>
            <Building2 aria-hidden="true" className="h-4 w-4" /> Add department
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

      {/* GRID VIEW — department cards → year cards → blocks, with breadcrumbs */}
      {view === "grid" && (
        <div className="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => { setSelectedDeptId(null); setSelectedYear(null); }}
              className={`rounded-md px-2 py-1 transition-colors duration-200 hover:bg-surface-2 ${selectedDeptId === null ? "font-semibold text-text" : "text-muted"}`}
            >
              All departments
            </button>
            {selectedGroup && (
              <>
                <span aria-hidden="true" className="text-muted">/</span>
                <button
                  type="button"
                  onClick={() => setSelectedYear(null)}
                  className={`rounded-md px-2 py-1 transition-colors duration-200 hover:bg-surface-2 ${selectedYear === null ? "font-semibold text-text" : "text-muted"}`}
                >
                  {selectedGroup.department.name}
                </button>
              </>
            )}
            {selectedGroup && selectedYear && (
              <>
                <span aria-hidden="true" className="text-muted">/</span>
                <span className="px-2 py-1 font-semibold text-text">{yearLabel(selectedYear)}</span>
              </>
            )}
          </nav>

          {!selectedGroup && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deptGroups.map((g) => (
                <button
                  key={g.department.id}
                  type="button"
                  onClick={() => { setSelectedDeptId(g.department.id); setSelectedYear(null); }}
                  className="group rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <Building2 aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="truncate text-base font-semibold text-text">{g.department.name}</span>
                  </span>
                  <span className="mt-3 block text-2xl font-semibold tabular-nums text-text">{g.blockCount}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {g.years.length} year level{g.years.length === 1 ? "" : "s"} · click to view blocks
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedGroup && !selectedYear && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => openCreate(selectedGroup.department.id)}>
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                  Add block in {selectedGroup.department.name}
                </Button>
              </div>
              {selectedGroup.years.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface">
                  <EmptyState
                    title="No blocks in this department yet"
                    description="Add the first block — pick the year level inside the form."
                    icon={Plus}
                    action={<Button size="sm" onClick={() => openCreate(selectedGroup.department.id)}><Plus aria-hidden="true" className="h-4 w-4" /> Add block</Button>}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedGroup.years.map((yg) => (
                    <button
                      key={yg.year}
                      type="button"
                      onClick={() => setSelectedYear(yg.year)}
                      className="rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block text-base font-semibold text-text">{yg.label}</span>
                      <span className="mt-2 block text-2xl font-semibold tabular-nums text-text">{yg.blocks.length}</span>
                      <span className="mt-1 block text-xs text-muted">block{yg.blocks.length === 1 ? "" : "s"} · click to view</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedGroup && selectedYear && (
            <div className="rounded-lg border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
                <div>
                  <p className="text-base font-semibold text-text">
                    {selectedGroup.department.name} · {yearLabel(selectedYear)}
                  </p>
                  <p className="text-sm text-muted">
                    {selectedYearGroup?.blocks.length ?? 0} block{(selectedYearGroup?.blocks.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => openCreate(selectedGroup.department.id, selectedYear)}>
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                  Add block
                </Button>
              </div>
              <div className="p-4 sm:p-5">
                {selectedYearGroup && selectedYearGroup.blocks.length > 0 ? (
                  <BlockTable blocks={selectedYearGroup.blocks} onEdit={openEdit} onDelete={setDeleting} />
                ) : (
                  <EmptyState
                    title="No blocks in this year level"
                    description="Add the first block for this year level."
                    icon={Plus}
                    action={<Button size="sm" onClick={() => openCreate(selectedGroup.department.id, selectedYear)}><Plus aria-hidden="true" className="h-4 w-4" /> Add block</Button>}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW ANCHOR */}
      {view === "list" && (deptGroups.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            title="No departments yet"
            description="Add a department first, then add its blocks."
            icon={Building2}
            action={<Button size="sm" onClick={() => { setCreatingDept(true); setDeptName(""); setDeptError(null); }}><Building2 aria-hidden="true" className="h-4 w-4" /> Add department</Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {deptGroups.map((group) => {
            const deptOpen = openDepts.includes(group.department.id);
            return (
              <Card key={group.department.id}>
                <div className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => toggleDept(group.department.id)}
                    aria-expanded={deptOpen}
                    aria-controls={`dept-${group.department.id}`}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${deptOpen ? "rotate-180" : ""}`}
                      />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                        <Building2 aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="text-base font-semibold tracking-tight text-text">{group.department.name}</span>
                        <span className="text-sm text-muted">
                          {group.blockCount === 0
                            ? "No blocks yet"
                            : `${group.blockCount} block${group.blockCount === 1 ? "" : "s"} across ${group.years.length} year level${group.years.length === 1 ? "" : "s"} · click to view`}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
                {deptOpen && (
                  <div id={`dept-${group.department.id}`} className="flex flex-col gap-3 px-4 py-4 sm:px-5">
                    <div className="flex justify-end">
                      <Button variant="secondary" size="sm" onClick={() => openCreate(group.department.id)}>
                        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                        Add block in {group.department.name}
                      </Button>
                    </div>
                    {group.years.length === 0 && (
                      <EmptyState
                        title="No blocks in this department yet"
                        description="Add the first block — pick the year level inside the form."
                        icon={Plus}
                        action={<Button size="sm" onClick={() => openCreate(group.department.id)}><Plus aria-hidden="true" className="h-4 w-4" /> Add block</Button>}
                      />
                    )}
                    {group.years.map((yearGroup) => {
                      const yearKey = `${group.department.id}--${yearGroup.year}`;
                      const yearOpen = openYears.includes(yearKey);
                      return (
                        <div key={yearKey} className="rounded-md border border-border">
                          <button
                            type="button"
                            onClick={() => toggleYear(yearKey)}
                            aria-expanded={yearOpen}
                            aria-controls={`blocks-${yearKey}`}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span className="flex items-center gap-2.5">
                              <ChevronDown
                                aria-hidden="true"
                                className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${yearOpen ? "rotate-180" : ""}`}
                              />
                              <span className="text-sm font-semibold text-text">{yearGroup.label}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="text-xs text-muted">
                                {yearGroup.blocks.length} block{yearGroup.blocks.length === 1 ? "" : "s"}
                              </span>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openCreate(group.department.id, yearGroup.year); }}
                              >
                                <Plus aria-hidden="true" className="h-3 w-3" />
                                Add
                              </Button>
                            </span>
                          </button>
                          {yearOpen && (
                            <div id={`blocks-${yearKey}`} className="px-3 pb-3">
                              {yearGroup.blocks.length === 0 ? (
                                <EmptyState
                                  title={`No blocks in ${yearGroup.label}`}
                                  description="Add the first block for this year level."
                                  icon={Plus}
                                  action={<Button size="sm" onClick={() => openCreate(group.department.id, yearGroup.year)}><Plus aria-hidden="true" className="h-4 w-4" /> Add block</Button>}
                                />
                              ) : (
                                <BlockTable
                                  blocks={yearGroup.blocks}
                                  onEdit={openEdit}
                                  onDelete={setDeleting}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ))}

      <Dialog
        open={dialogOpen}
        onClose={() => { setCreatingYear(null); setEditing(null); }}
        title={editing ? "Edit block" : creatingYear ? `Add block in ${yearLabel(creatingYear)}` : "Add block"}
      >
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          {formError && <Notice variant="error">{formError}</Notice>}
          <Field label="Department" error={fieldErrors.departmentId} required hint="Only existing departments are selectable.">
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.departmentId ?? ""} invalid={invalid} onChange={(e) => setValues((v) => ({ ...v, departmentId: e.target.value }))}>
                <option value="" disabled>Select a department…</option>
                {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
              </Select>
            )}
          </Field>
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

      <Dialog
        open={creatingDept}
        onClose={() => setCreatingDept(false)}
        title="Add department"
      >
        <form onSubmit={saveDepartment} className="flex flex-col gap-4" noValidate>
          {deptError && <Notice variant="error">{deptError}</Notice>}
          <Field label="Department name" required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={deptName} placeholder="e.g., IT Department" onChange={(e) => setDeptName(e.target.value)} />
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setCreatingDept(false)}>Cancel</Button>
            <Button type="submit" loading={savingDept}>Create department</Button>
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
