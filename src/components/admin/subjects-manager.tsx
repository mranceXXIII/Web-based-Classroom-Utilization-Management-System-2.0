"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Building2, ChevronDown, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Dialog, ConfirmDialog } from "@/components/ui/dialog";
import { Notice, EmptyState, SkeletonRows } from "@/components/notice";
import { Card } from "@/components/ui/card";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import type { DepartmentDTO, SubjectDTO } from "@/lib/types";
import { ApiError, apiFetch } from "@/components/api-client";

/* Subjects module — Department → Year level → Subjects, all as collapsible
 * cards (mirrors the Blocks module): click a department to see its year
 * levels, click a year level to see its subjects. "Add department" creates a
 * new department; "Add subject" selects an existing department. CRUD goes
 * through the frozen /api/crud/subjects and /api/crud/departments contracts.
 * Server pages pass only serializable props. */

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
  subjects: SubjectDTO[];
}

interface DepartmentGroup {
  department: DepartmentDTO;
  years: YearGroup[];
  subjectCount: number;
}
interface DepartmentGroup {
  department: DepartmentDTO;
  years: YearGroup[];
  subjectCount: number;
}

export function SubjectsManager({
  initialRows,
  initialDegraded,
  initialDepartments,
}: {
  initialRows: SubjectDTO[];
  initialDegraded: boolean;
  initialDepartments: DepartmentDTO[];
}) {
  const [rows, setRows] = useState<SubjectDTO[]>(initialRows);
  const [departments, setDepartments] = useState<DepartmentDTO[]>(initialDepartments);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDepts, setOpenDepts] = useState<number[]>([]);
  const [openYears, setOpenYears] = useState<string[]>([]); // `${deptId}--${year}`
  const [creatingYear, setCreatingYear] = useState<string | null>(null); // null = subject dialog closed
  const [creatingDept, setCreatingDept] = useState(false);
  const [editing, setEditing] = useState<SubjectDTO | null>(null);
  const [deleting, setDeleting] = useState<SubjectDTO | null>(null);
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
      const [subjects, depts] = await Promise.all([
        apiFetch<SubjectDTO[]>("/api/crud/subjects"),
        apiFetch<DepartmentDTO[]>("/api/crud/departments"),
      ]);
      if (mountedRef.current) { setRows(subjects); setDepartments(depts); setDegraded(false); }
    } catch (err) {
      if (mountedRef.current) {
        setListError(err instanceof ApiError ? err.message : "Could not load data.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const deptGroups = useMemo<DepartmentGroup[]>(() => {
    return departments.map((department) => {
      const deptSubjects = rows.filter((s) => s.departmentId === department.id);
      const yearMap = new Map<string, SubjectDTO[]>();
      for (const s of deptSubjects) {
        const list = yearMap.get(s.yearLevel) ?? [];
        list.push(s);
        yearMap.set(s.yearLevel, list);
      }
      const years = Array.from(yearMap.entries())
        .map(([year, subjects]) => ({
          year,
          label: yearLabel(year),
          subjects: subjects.sort((a, b) => a.description.localeCompare(b.description)),
        }))
        .sort((a, b) => yearSortKey(a.year) - yearSortKey(b.year) || a.year.localeCompare(b.year));
      return { department, years, subjectCount: deptSubjects.length };
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
    setValues({ description: "", yearLevel: year ?? "", departmentId: dept !== undefined ? String(dept) : "" });
    setFieldErrors({});
    setFormError(null);
    setCreatingYear(year ?? "");
    setEditing(null);
  }

  function openEdit(subject: SubjectDTO) {
    setValues({
      description: subject.description,
      yearLevel: subject.yearLevel,
      departmentId: subject.departmentId === null ? "" : String(subject.departmentId),
    });
    setFieldErrors({});
    setFormError(null);
    setEditing(subject);
    setCreatingYear(null);
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = { description: values.description ?? "", yearLevel: values.yearLevel ?? "" };
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
        await apiFetch("/api/crud/subjects", { method: "PUT", body: JSON.stringify({ ...payload, id: editing.id }) });
      } else {
        await apiFetch("/api/crud/subjects", { method: "POST", body: JSON.stringify(payload) });
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
      await apiFetch(`/api/crud/subjects?id=${deleting.id}`, { method: "DELETE" });
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
          <h1 className="text-lg font-semibold tracking-tight text-text">Subjects</h1>
          <p className="mt-0.5 text-sm text-muted">Departments to year levels to subjects - click a department to drill down.</p>
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
            <Plus aria-hidden="true" className="h-4 w-4" /> Add subject
          </Button>
        </div>
      </div>

      {degraded && (
        <Notice variant="muted" title="Sample data">
          The backend API is not reachable yet, so a sample list is shown. Use Refresh once it is live.
        </Notice>
      )}
      {listError && (
        <Notice variant="error" title="Could not load the list">
          {listError} <button type="button" onClick={reload} className="font-medium underline underline-offset-2">Retry</button>
        </Notice>
      )}

      {view === "grid" && (
        <div className="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
            <button type="button" onClick={() => { setSelectedDeptId(null); setSelectedYear(null); }} className={`rounded-md px-2 py-1 transition-colors duration-200 hover:bg-surface-2 ${selectedDeptId === null ? "font-semibold text-text" : "text-muted"}`}>
              All departments
            </button>
            {selectedGroup && (
              <>
                <span aria-hidden="true" className="text-muted">/</span>
                <button type="button" onClick={() => setSelectedYear(null)} className={`rounded-md px-2 py-1 transition-colors duration-200 hover:bg-surface-2 ${selectedYear === null ? "font-semibold text-text" : "text-muted"}`}>
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
                <button key={g.department.id} type="button" onClick={() => { setSelectedDeptId(g.department.id); setSelectedYear(null); }} className="rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <Building2 aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="truncate text-base font-semibold text-text">{g.department.name}</span>
                  </span>
                  <span className="mt-3 block text-2xl font-semibold tabular-nums text-text">{g.subjectCount}</span>
                  <span className="mt-1 block text-xs text-muted">{g.years.length} year level{g.years.length === 1 ? "" : "s"} - click to view subjects</span>
                </button>
              ))}
            </div>
          )}

          {selectedGroup && !selectedYear && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => openCreate(selectedGroup.department.id)}>
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" /> Add subject in {selectedGroup.department.name}
                </Button>
              </div>
              {selectedGroup.years.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface">
                  <EmptyState title="No subjects in this department yet" description="Add the first subject - pick the year level inside the form." icon={Plus} action={<Button size="sm" onClick={() => openCreate(selectedGroup.department.id)}><Plus aria-hidden="true" className="h-4 w-4" /> Add subject</Button>} />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedGroup.years.map((yg) => (
                    <button key={yg.year} type="button" onClick={() => setSelectedYear(yg.year)} className="rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="block text-base font-semibold text-text">{yg.label}</span>
                      <span className="mt-2 block text-2xl font-semibold tabular-nums text-text">{yg.subjects.length}</span>
                      <span className="mt-1 block text-xs text-muted">subject{yg.subjects.length === 1 ? "" : "s"} - click to view</span>
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
                  <p className="text-base font-semibold text-text">{selectedGroup.department.name} | {yearLabel(selectedYear)}</p>
                  <p className="text-sm text-muted">{selectedYearGroup?.subjects.length ?? 0} subject{(selectedYearGroup?.subjects.length ?? 0) === 1 ? "" : "s"}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => openCreate(selectedGroup.department.id, selectedYear)}>
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" /> Add subject
                </Button>
              </div>
              <div className="p-4 sm:p-5">
                {selectedYearGroup && selectedYearGroup.subjects.length > 0 ? (
                  <ul className="flex flex-col divide-y divide-border">
                    {selectedYearGroup.subjects.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                        <span className="text-sm font-medium text-text">{s.description}</span>
                        <span className="inline-flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)} aria-label={`Edit ${s.description}`}>
                            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} aria-label={`Delete ${s.description}`} className="hover:text-danger">
                            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No subjects in this year level" description="Add the first subject for this year level." icon={Plus} action={<Button size="sm" onClick={() => openCreate(selectedGroup.department.id, selectedYear)}><Plus aria-hidden="true" className="h-4 w-4" /> Add subject</Button>} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {view === "list" && (deptGroups.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState title="No departments yet" description="Add a department first, then add its subjects." icon={Building2} action={<Button size="sm" onClick={() => { setCreatingDept(true); setDeptName(""); setDeptError(null); }}><Building2 aria-hidden="true" className="h-4 w-4" /> Add department</Button>} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {deptGroups.map((group) => {
            const deptOpen = openDepts.includes(group.department.id);
            return (
              <Card key={group.department.id}>
                <div className="border-b border-border">
                  <button type="button" onClick={() => toggleDept(group.department.id)} aria-expanded={deptOpen} aria-controls={`dept-${group.department.id}`} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition-colors duration-200 hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5">
                    <span className="flex min-w-0 items-center gap-3">
                      <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${deptOpen ? "rotate-180" : ""}`} />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                        <Building2 aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="text-base font-semibold tracking-tight text-text">{group.department.name}</span>
                        <span className="text-sm text-muted">
                          {group.subjectCount === 0 ? "No subjects yet" : `${group.subjectCount} subject${group.subjectCount === 1 ? "" : "s"} across ${group.years.length} year level${group.years.length === 1 ? "" : "s"} - click to view`}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>
                {deptOpen && (
                  <div id={`dept-${group.department.id}`} className="flex flex-col gap-3 px-4 py-4 sm:px-5">
                    <div className="flex justify-end">
                      <Button variant="secondary" size="sm" onClick={() => openCreate(group.department.id)}>
                        <Plus aria-hidden="true" className="h-3.5 w-3.5" /> Add subject in {group.department.name}
                      </Button>
                    </div>
                    {group.years.length === 0 && (
                      <EmptyState title="No subjects in this department yet" description="Add the first subject - pick the year level inside the form." icon={Plus} action={<Button size="sm" onClick={() => openCreate(group.department.id)}><Plus aria-hidden="true" className="h-4 w-4" /> Add subject</Button>} />
                    )}
                    {group.years.map((yearGroup) => {
                      const yearKey = `${group.department.id}--${yearGroup.year}`;
                      const yearOpen = openYears.includes(yearKey);
                      return (
                        <div key={yearKey} className="rounded-md border border-border">
                          <button type="button" onClick={() => toggleYear(yearKey)} aria-expanded={yearOpen} aria-controls={`subjects-${yearKey}`} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <span className="flex items-center gap-2.5">
                              <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${yearOpen ? "rotate-180" : ""}`} />
                              <span className="text-sm font-semibold text-text">{yearGroup.label}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="text-xs text-muted">{yearGroup.subjects.length} subject{yearGroup.subjects.length === 1 ? "" : "s"}</span>
                              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openCreate(group.department.id, yearGroup.year); }}>
                                <Plus aria-hidden="true" className="h-3 w-3" /> Add
                              </Button>
                            </span>
                          </button>
                          {yearOpen && (
                            <ul id={`subjects-${yearKey}`} className="divide-y divide-border border-t border-border px-3">
                              {yearGroup.subjects.map((s) => (
                                <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                                  <span className="text-sm text-text">{s.description}</span>
                                  <span className="inline-flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)} aria-label={`Edit ${s.description}`}>
                                      <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} aria-label={`Delete ${s.description}`} className="hover:text-danger">
                                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                                    </Button>
                                  </span>
                                </li>
                              ))}
                            </ul>
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
        title={editing ? "Edit subject" : creatingYear ? `Add subject in ${yearLabel(creatingYear)}` : "Add subject"}
      >
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          {formError && <Notice variant="error">{formError}</Notice>}
          <Field label="Department" error={fieldErrors.departmentId} required hint="Only existing departments are selectable.">
            {({ id, describedBy, invalid }) => (
              <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.departmentId ?? ""} invalid={invalid} onChange={(e) => setValues((v) => ({ ...v, departmentId: e.target.value }))}>
                <option value="" disabled>Select a department...</option>
                {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
              </Select>
            )}
          </Field>
          <Field label="Year level" error={fieldErrors.yearLevel} required hint="Number (1-6) or a free label.">
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.yearLevel ?? ""} invalid={invalid} placeholder="e.g., 3" onChange={(e) => setValues((v) => ({ ...v, yearLevel: e.target.value }))} />
            )}
          </Field>
          <Field label="Subject description" error={fieldErrors.description} required>
            {({ id, describedBy, invalid }) => (
              <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.description ?? ""} invalid={invalid} placeholder="e.g., Assessment in Learning 1" onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => { setCreatingYear(null); setEditing(null); }}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Create"}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={creatingDept} onClose={() => setCreatingDept(false)} title="Add department">
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
        title="Delete subject?"
        message={`This permanently removes ${deleting?.description ?? "this subject"}. Schedules using it are removed by the server if they would break references.`}
        loading={removing}
      />
    </section>
  );
}
