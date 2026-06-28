import { useMemo, useState } from 'react';
import { GraduationCap, ChevronRight, RotateCcw } from 'lucide-react';
import { RSU_FACULTIES, type Course, type Department, type Faculty } from '../data/rsuData';

interface CoursePickerProps {
  onSelect: (courseId: string) => void;
}

/** Faculty -> Department -> Course cascading picker. */
export function CoursePicker({ onSelect }: CoursePickerProps) {
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const faculty: Faculty | undefined = RSU_FACULTIES.find((f) => f.id === facultyId);
  const department: Department | undefined = faculty?.departments.find((d) => d.id === departmentId);

  return (
    <div className="rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap size={18} className="text-school-green" />
        <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Select your course</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Faculty / College
          </span>
          <select
            value={facultyId}
            onChange={(e) => {
              setFacultyId(e.target.value);
              setDepartmentId('');
            }}
            className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="">Choose a faculty</option>
            {RSU_FACULTIES.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Department
          </span>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={!faculty}
            className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green disabled:opacity-50 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="">Choose a department</option>
            {faculty?.departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Course
          </span>
          <select
            value=""
            onChange={(e) => e.target.value && onSelect(e.target.value)}
            disabled={!department}
            className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green disabled:opacity-50 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="">Choose a course</option>
            {department?.courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

interface CourseSummaryCardProps {
  faculty: Faculty;
  course: Course;
  onChangeCourse: () => void;
}

/** "Faculty: X — Your JAMB Subjects: Y" header shown across Revision, Practice and Exam Focus. */
export function CourseSummaryCard({ faculty, course, onChangeCourse }: CourseSummaryCardProps) {
  const subjects = useMemo(
    () => course.jambSubjects.map((s) => s.replace(/\//g, ' or ')).join(', '),
    [course.jambSubjects]
  );

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-school-green/20 bg-school-pale px-5 py-4 dark:border-school-green/30 dark:bg-school-green/10">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-school-green">{faculty.name}</p>
        <p className="mt-1 font-sora font-semibold text-school-navy dark:text-white">{course.name}</p>
        <p className="mt-1 text-sm text-school-navy/70 dark:text-slate-300">
          <span className="font-semibold">Your JAMB Subjects:</span> {subjects}
        </p>
      </div>
      <button
        onClick={onChangeCourse}
        className="flex flex-none items-center gap-1.5 rounded-lg border border-school-green/30 bg-white px-3 py-1.5 text-xs font-semibold text-school-green hover:bg-school-light dark:border-school-green/40 dark:bg-school-navy/60 dark:hover:bg-school-navy/40"
      >
        <RotateCcw size={12} /> Change course
      </button>
    </div>
  );
}

export function FacultyBrowseHint() {
  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs text-school-muted">
      <ChevronRight size={12} /> Pick your faculty, then department, then exact course to personalize your practice.
    </p>
  );
}
