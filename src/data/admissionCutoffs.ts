/**
 * RSU 2025/2026 departmental admission cut-off marks (aggregate, out of 100).
 * Source: MySchool.ng "RSU undergraduate admission cut-off marks for 2025/2026",
 * confirmed by the site owner. `merit` is the main cut-off; `catchment` is the
 * lower catchment-area cut-off where published. `merit: null` = no cut-off was
 * published for that programme (shown as "not published" in the UI).
 *
 * These are ESTIMATES from a previous session — final admission is decided by
 * RSU. The Admission Predictor labels them as such.
 */
export type Stream = 'Science' | 'Arts' | 'Commercial';

export interface CutoffCourse {
  id: string;
  course: string;
  faculty: string;
  streams: Stream[];
  merit: number | null;
  catchment?: number | null;
}

export const CUTOFFS: CutoffCourse[] = [
  // ── College of Medical Sciences ──
  { id: 'medicine-surgery', course: 'Medicine & Surgery', faculty: 'Medical Sciences', streams: ['Science'], merit: 71, catchment: 68 },
  { id: 'nursing', course: 'Nursing Sciences', faculty: 'Medical Sciences', streams: ['Science'], merit: 66, catchment: 63 },
  { id: 'medical-lab-science', course: 'Medical Laboratory Science', faculty: 'Medical Sciences', streams: ['Science'], merit: 58, catchment: 55 },
  { id: 'human-anatomy', course: 'Human Anatomy', faculty: 'Medical Sciences', streams: ['Science'], merit: 48, catchment: 45 },
  { id: 'human-physiology', course: 'Human Physiology', faculty: 'Medical Sciences', streams: ['Science'], merit: 48, catchment: 43 },
  { id: 'physiotherapy', course: 'Physiotherapy', faculty: 'Medical Sciences', streams: ['Science'], merit: 48, catchment: 44 },
  { id: 'public-health', course: 'Public Health Sciences', faculty: 'Medical Sciences', streams: ['Science'], merit: 47 },

  // ── Engineering ──
  { id: 'computer-engineering', course: 'Computer Engineering', faculty: 'Engineering', streams: ['Science'], merit: 55, catchment: 50 },
  { id: 'mechanical-engineering', course: 'Mechanical Engineering', faculty: 'Engineering', streams: ['Science'], merit: 55 },
  { id: 'electrical-engineering', course: 'Electrical Engineering', faculty: 'Engineering', streams: ['Science'], merit: 54, catchment: 48 },
  { id: 'civil-engineering', course: 'Civil Engineering', faculty: 'Engineering', streams: ['Science'], merit: 49, catchment: 44 },
  { id: 'marine-engineering', course: 'Marine Engineering', faculty: 'Engineering', streams: ['Science'], merit: 49, catchment: 45 },
  { id: 'petroleum-engineering', course: 'Petroleum Engineering', faculty: 'Engineering', streams: ['Science'], merit: 46, catchment: 45 },
  { id: 'agric-env-engineering', course: 'Agricultural & Environmental Engineering', faculty: 'Engineering', streams: ['Science'], merit: 39 },
  { id: 'chemical-petrochemical-engineering', course: 'Chemical / Petrochemical Engineering', faculty: 'Engineering', streams: ['Science'], merit: 34 },

  // ── Sciences ──
  { id: 'computer-science', course: 'Computer Science', faculty: 'Sciences', streams: ['Science'], merit: 57, catchment: 53 },
  { id: 'microbiology', course: 'Microbiology', faculty: 'Sciences', streams: ['Science'], merit: 47, catchment: 37 },
  { id: 'mathematics', course: 'Mathematics', faculty: 'Sciences', streams: ['Science'], merit: 43 },
  { id: 'animal-env-biology', course: 'Animal & Environmental Biology', faculty: 'Sciences', streams: ['Science'], merit: 43 },
  { id: 'maritime-science', course: 'Maritime Science', faculty: 'Sciences', streams: ['Science'], merit: 42 },
  { id: 'plant-science-biotech', course: 'Plant Science & Biotechnology', faculty: 'Sciences', streams: ['Science'], merit: 39 },
  { id: 'chemistry', course: 'Chemistry', faculty: 'Sciences', streams: ['Science'], merit: 37 },
  { id: 'biochemistry', course: 'Biochemistry', faculty: 'Sciences', streams: ['Science'], merit: 36 },
  { id: 'geology', course: 'Geology', faculty: 'Sciences', streams: ['Science'], merit: 35 },
  { id: 'physics', course: 'Physics', faculty: 'Sciences', streams: ['Science'], merit: null },

  // ── Law ──
  { id: 'law', course: 'Law', faculty: 'Law', streams: ['Arts'], merit: 69, catchment: 67 },
  { id: 'medical-law', course: 'Medical Law', faculty: 'Law', streams: ['Arts'], merit: 47 },

  // ── Management / Admin Sciences ──
  { id: 'accounting', course: 'Accounting', faculty: 'Management Sciences', streams: ['Commercial'], merit: 57, catchment: 52 },
  { id: 'business-administration', course: 'Business Administration', faculty: 'Management Sciences', streams: ['Commercial'], merit: 53, catchment: 50 },
  { id: 'logistics-supply', course: 'Logistics & Supply Chain Management', faculty: 'Management Sciences', streams: ['Commercial'], merit: 45 },
  { id: 'hr-management', course: 'Employment & Human Resource Management', faculty: 'Management Sciences', streams: ['Commercial'], merit: 38 },
  { id: 'finance', course: 'Finance', faculty: 'Management Sciences', streams: ['Commercial'], merit: 35 },
  { id: 'marketing', course: 'Marketing', faculty: 'Management Sciences', streams: ['Commercial'], merit: 35 },
  { id: 'office-info-management', course: 'Office & Information Management', faculty: 'Management Sciences', streams: ['Commercial'], merit: 33 },

  // ── Environmental Sciences ──
  { id: 'environmental-management', course: 'Environmental Management', faculty: 'Environmental Sciences', streams: ['Science'], merit: 55, catchment: 49 },
  { id: 'estate-management', course: 'Estate Management', faculty: 'Environmental Sciences', streams: ['Science', 'Commercial'], merit: 42 },
  { id: 'geography-environment', course: 'Geography & Environment', faculty: 'Environmental Sciences', streams: ['Science', 'Arts'], merit: 42 },
  { id: 'quantity-surveying', course: 'Quantity Surveying', faculty: 'Environmental Sciences', streams: ['Science'], merit: 42 },
  { id: 'surveying-geomatics', course: 'Surveying & Geomatics', faculty: 'Environmental Sciences', streams: ['Science'], merit: 42 },
  { id: 'urban-regional-planning', course: 'Urban & Regional Planning', faculty: 'Environmental Sciences', streams: ['Science'], merit: 42 },

  // ── Communication & Media Studies ──
  { id: 'broadcasting-cinematography', course: 'Broadcasting & Cinematography', faculty: 'Communication & Media', streams: ['Arts'], merit: 56, catchment: 54 },
  { id: 'journalism-media', course: 'Journalism & Media Studies', faculty: 'Communication & Media', streams: ['Arts'], merit: 53, catchment: 48 },
  { id: 'dev-communication', course: 'Development & Communication Studies', faculty: 'Communication & Media', streams: ['Arts'], merit: null },
  { id: 'pr-advertising', course: 'Public Relations & Advertising', faculty: 'Communication & Media', streams: ['Arts'], merit: null },

  // ── Agriculture ──
  { id: 'home-science', course: 'Home Science & Management', faculty: 'Agriculture', streams: ['Science'], merit: 46 },
  { id: 'fisheries', course: 'Fisheries & Aquatic Environment', faculty: 'Agriculture', streams: ['Science'], merit: 43 },
  { id: 'animal-science', course: 'Animal Science', faculty: 'Agriculture', streams: ['Science'], merit: 39 },
  { id: 'agric-economics', course: 'Agricultural & Applied Economics', faculty: 'Agriculture', streams: ['Science', 'Commercial'], merit: 38 },
  { id: 'food-science', course: 'Food Science & Technology', faculty: 'Agriculture', streams: ['Science'], merit: 37 },
  { id: 'agric-extension', course: 'Agric Extension & Rural Development', faculty: 'Agriculture', streams: ['Science'], merit: null },
  { id: 'forestry', course: 'Forestry & Environment', faculty: 'Agriculture', streams: ['Science'], merit: null },
  { id: 'soil-science', course: 'Soil Science', faculty: 'Agriculture', streams: ['Science'], merit: null },

  // ── Humanities ──
  { id: 'french', course: 'French', faculty: 'Humanities', streams: ['Arts'], merit: 49 },
  { id: 'english-literature', course: 'English & Literature in English', faculty: 'Humanities', streams: ['Arts'], merit: 38 },

  // ── Education ──
  { id: 'library-info-science', course: 'Library & Information Science', faculty: 'Education', streams: ['Arts'], merit: 40 },
  { id: 'science-education', course: 'Science Education', faculty: 'Education', streams: ['Science'], merit: 40 },
  { id: 'vocational-technical-ed', course: 'Vocational & Technical Education', faculty: 'Education', streams: ['Science'], merit: 40 },
  { id: 'adult-community-ed', course: 'Adult & Community Education', faculty: 'Education', streams: ['Arts'], merit: 39 },
  { id: 'business-education', course: 'Business Education', faculty: 'Education', streams: ['Commercial'], merit: 38 },

  // ── Social Sciences ──
  { id: 'political-science', course: 'Political Science', faculty: 'Social Sciences', streams: ['Arts', 'Commercial'], merit: 41 },
  { id: 'psychology', course: 'Psychology', faculty: 'Social Sciences', streams: ['Science', 'Arts'], merit: 40 },
  { id: 'sociology', course: 'Sociology', faculty: 'Social Sciences', streams: ['Arts'], merit: 36 },
  { id: 'economics', course: 'Economics', faculty: 'Social Sciences', streams: ['Commercial'], merit: 33 },
];
