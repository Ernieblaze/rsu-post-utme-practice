const COURSE_KEY = 'rsu_selected_course_id';

export function getSelectedCourseId(): string | null {
  try {
    return localStorage.getItem(COURSE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedCourseId(courseId: string): void {
  localStorage.setItem(COURSE_KEY, courseId);
}

export function clearSelectedCourseId(): void {
  localStorage.removeItem(COURSE_KEY);
}
