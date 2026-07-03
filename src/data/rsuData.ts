/**
 * RSU faculties, departments, and courses, each paired with the exact JAMB
 * subject combination required for admission. This is the single source of
 * truth for course selection across Revision, Practice, and Exam Focus.
 *
 * Subject names here are the canonical display names (e.g. "Use of English",
 * not "English"). The question bank may use slightly different historical
 * names for the same subject — see `SUBJECT_ALIASES` in `subjectMatch.ts`,
 * which maps bank subject names onto these canonical names. Course data
 * itself is never silently invented: faculties/courses not yet confirmed
 * with real RSU department names are intentionally left out rather than
 * guessed.
 */

export interface Course {
  id: string;
  name: string;
  /**
   * Usually 4 entries (JAMB requires 4), but some courses list a 5th when RSU's
   * Post-UTME screening tests an extra subject — e.g. medical courses screen on
   * Mathematics in addition to English/Biology/Physics/Chemistry.
   * A slash-joined string ("Chemistry/Biology/Economics") means "any one of these".
   */
  jambSubjects: string[];
  olevelRequirements?: string;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  courses: Course[];
}

export interface Faculty {
  id: string;
  name: string;
  /** Subject combination shared by every course in this faculty, shown as a quick summary. */
  commonSubjectCombo: string;
  departments: Department[];
}

function course(id: string, name: string, jambSubjects: string[], notes?: string): Course {
  return { id, name, jambSubjects, notes };
}

export const RSU_FACULTIES: Faculty[] = [
  {
    id: 'science',
    name: 'Faculty of Science',
    commonSubjectCombo: 'Use of English, Mathematics, Physics, Chemistry (or Biology for some)',
    departments: [
      {
        id: 'computer-science',
        name: 'Department of Computer Science',
        courses: [
          course('bsc-computer-science', 'B.Sc. Computer Science', [
            'Use of English', 'Mathematics', 'Physics', 'Chemistry/Biology/Economics',
          ]),
        ],
      },
      {
        id: 'mathematics',
        name: 'Department of Mathematics',
        courses: [
          course('bsc-mathematics', 'B.Sc. Mathematics', ['Use of English', 'Mathematics', 'Physics', 'Chemistry']),
        ],
      },
      {
        id: 'physics',
        name: 'Department of Physics',
        courses: [
          course('bsc-physics', 'B.Sc. Physics', ['Use of English', 'Physics', 'Mathematics', 'Chemistry/Biology']),
        ],
      },
      {
        id: 'chemistry',
        name: 'Department of Chemistry',
        courses: [
          course('bsc-chemistry', 'B.Sc. Chemistry', ['Use of English', 'Chemistry', 'Mathematics', 'Physics/Biology']),
        ],
      },
      {
        id: 'biochemistry',
        name: 'Department of Biochemistry',
        courses: [
          course('bsc-biochemistry', 'B.Sc. Biochemistry', ['Use of English', 'Biology', 'Chemistry', 'Physics/Mathematics']),
        ],
      },
      {
        id: 'microbiology',
        name: 'Department of Microbiology',
        courses: [
          course('bsc-microbiology', 'B.Sc. Microbiology', ['Use of English', 'Biology', 'Chemistry', 'Physics/Mathematics']),
        ],
      },
      {
        id: 'plant-science-biotechnology',
        name: 'Department of Plant Science and Biotechnology',
        courses: [
          course('bsc-plant-science-biotechnology', 'B.Sc. Plant Science and Biotechnology', [
            'Use of English', 'Biology', 'Chemistry', 'Physics/Mathematics',
          ]),
        ],
      },
      {
        id: 'animal-environmental-biology',
        name: 'Department of Animal and Environmental Biology',
        courses: [
          course('bsc-animal-environmental-biology', 'B.Sc. Animal and Environmental Biology', [
            'Use of English', 'Biology', 'Chemistry', 'Physics/Mathematics',
          ]),
        ],
      },
      {
        id: 'geology',
        name: 'Department of Geology',
        courses: [
          course('bsc-geology', 'B.Sc. Geology', ['Use of English', 'Physics', 'Chemistry', 'Mathematics']),
        ],
      },
      {
        id: 'maritime-science',
        name: 'Department of Maritime Science',
        courses: [
          course('bsc-maritime-science', 'B.Sc. Maritime Science', [
            'Use of English', 'Mathematics', 'Physics', 'Chemistry/Biology/Economics',
          ]),
        ],
      },
    ],
  },
  {
    id: 'medical-health-sciences',
    name: 'College of Medical Sciences / Health Sciences',
    commonSubjectCombo: 'Use of English, Biology, Physics, Chemistry',
    departments: [
      {
        id: 'basic-medical-sciences',
        name: 'Basic Medical Sciences',
        courses: [
          course('bsc-human-anatomy', 'B.Sc. Human Anatomy', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
          course('bsc-human-physiology', 'B.Sc. Human Physiology', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
          course('bsc-medical-biochemistry', 'B.Sc. Medical Biochemistry', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
          course('bnsc-nursing-science', 'B.NSc. Nursing Science', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
          course('bsc-public-health-science', 'B.Sc. Public Health Science', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
          course('brs-radiography', 'B.RS. Radiography', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
          course('bsc-physiotherapy', 'B.Sc. Physiotherapy', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
        ],
      },
      {
        id: 'clinical-sciences',
        name: 'Clinical Sciences',
        courses: [
          course('mbbs-medicine-surgery', 'MBBS Medicine and Surgery', ['Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics']),
        ],
      },
      {
        id: 'medical-laboratory-science',
        name: 'Others',
        courses: [
          course('bmls-medical-laboratory-science', 'B.MLS. Medical Laboratory Science', [
            'Use of English', 'Biology', 'Physics', 'Chemistry', 'Mathematics',
          ]),
        ],
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Faculty of Engineering',
    commonSubjectCombo: 'Use of English, Mathematics, Physics, Chemistry',
    departments: [
      {
        id: 'engineering-departments',
        name: 'Engineering Departments',
        courses: [
          course('beng-agricultural-environmental-engineering', 'Agricultural and Environmental Engineering', [
            'Use of English', 'Mathematics', 'Physics', 'Chemistry',
          ]),
          course('beng-chemical-petrochemical-engineering', 'Chemical / Petrochemical Engineering', [
            'Use of English', 'Mathematics', 'Physics', 'Chemistry',
          ]),
          course('beng-civil-engineering', 'Civil Engineering', ['Use of English', 'Mathematics', 'Physics', 'Chemistry']),
          course('beng-computer-engineering', 'Computer Engineering', ['Use of English', 'Mathematics', 'Physics', 'Chemistry']),
          course('beng-electrical-electronic-engineering', 'Electrical and Electronic Engineering', [
            'Use of English', 'Mathematics', 'Physics', 'Chemistry',
          ]),
          course('beng-marine-engineering', 'Marine Engineering', ['Use of English', 'Mathematics', 'Physics', 'Chemistry']),
          course('beng-mechanical-engineering', 'Mechanical Engineering', ['Use of English', 'Mathematics', 'Physics', 'Chemistry']),
          course('beng-petroleum-engineering', 'Petroleum Engineering', ['Use of English', 'Mathematics', 'Physics', 'Chemistry']),
        ],
      },
    ],
  },
  {
    id: 'agriculture',
    name: 'Faculty of Agriculture',
    commonSubjectCombo: 'Use of English, Biology/Agricultural Science, Chemistry, Physics/Mathematics/Economics',
    departments: [
      {
        id: 'agriculture-departments',
        name: 'Agriculture Departments',
        courses: [
          course('bagric-agriculture', 'Agriculture', ['Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics']),
          course('bagric-economics-extension', 'Agricultural Economics & Extension', [
            'Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics',
          ]),
          course('bagric-animal-science', 'Animal Science', ['Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics']),
          course('bagric-crop-science', 'Crop Science', ['Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics']),
          course('bagric-soil-science', 'Soil Science', ['Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics']),
          course('bagric-fisheries-aquatic-environment', 'Fisheries and Aquatic Environment', [
            'Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics',
          ]),
          course('bagric-food-science-technology', 'Food Science and Technology', [
            'Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics',
          ]),
          course('bagric-forestry-wildlife', 'Forestry and Wildlife / Forest Resources Management', [
            'Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics',
          ]),
          course('bsc-home-science-management', 'Home Science and Management', [
            'Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Physics/Mathematics/Economics',
          ]),
        ],
      },
    ],
  },
  {
    id: 'law',
    name: 'Faculty of Law',
    commonSubjectCombo: 'Use of English, Literature in English, two of Government/CRS/History',
    departments: [
      {
        id: 'law-department',
        name: 'Department of Law',
        courses: [
          course('llb-law', 'LL.B. Law', ['Use of English', 'Literature in English', 'Government/CRS/History', 'Government/CRS/History']),
        ],
      },
    ],
  },
  {
    id: 'management-sciences',
    name: 'Faculty of Management Sciences',
    commonSubjectCombo: 'Use of English, Mathematics, Economics, any other Social Science subject',
    departments: [
      {
        id: 'management-sciences-departments',
        name: 'Management Sciences Departments',
        courses: [
          course('bsc-accounting', 'Accounting', ['Use of English', 'Mathematics', 'Economics', 'Any Social Science subject']),
          course('bsc-banking-finance', 'Banking and Finance', ['Use of English', 'Mathematics', 'Economics', 'Any Social Science subject']),
          course('bsc-business-administration', 'Business Administration / Management', [
            'Use of English', 'Mathematics', 'Economics', 'Any Social Science subject',
          ]),
          course('bsc-marketing', 'Marketing', ['Use of English', 'Mathematics', 'Economics', 'Any Social Science subject']),
          course('bsc-office-information-management', 'Office and Information Management', [
            'Use of English', 'Mathematics', 'Economics', 'Any Social Science subject',
          ]),
        ],
      },
    ],
  },
  {
    id: 'social-sciences',
    name: 'Faculty of Social Sciences',
    commonSubjectCombo: 'Use of English, Economics, Government, any other Social Science subject',
    departments: [
      {
        id: 'social-sciences-departments',
        name: 'Social Sciences Departments',
        courses: [
          course('bsc-economics', 'Economics', ['Use of English', 'Mathematics', 'Economics', 'Any Social Science subject']),
          course('bsc-political-science', 'Political Science', ['Use of English', 'Government', 'Economics', 'Any Social Science subject']),
          course('bsc-sociology', 'Sociology', ['Use of English', 'Economics', 'Government', 'Any Social Science subject']),
          course('bsc-psychology', 'Psychology', ['Use of English', 'Economics', 'Government', 'Any Social Science subject']),
          course('bsc-criminology-penology', 'Criminology and Penology', ['Use of English', 'Economics', 'Government', 'Any Social Science subject']),
        ],
      },
    ],
  },
  {
    id: 'humanities',
    name: 'Faculty of Humanities',
    commonSubjectCombo: 'Use of English + Literature/History/Arts subjects',
    departments: [
      {
        id: 'humanities-departments',
        name: 'Humanities Departments',
        courses: [
          course('ba-english-language', 'English Language', ['Use of English', 'Literature in English', 'Any Arts subject', 'Any Arts subject']),
          course('ba-history-diplomatic-studies', 'History and Diplomatic Studies', [
            'Use of English', 'History', 'Any Arts subject', 'Any Arts subject',
          ]),
          course('ba-theatre-arts', 'Theatre Arts', ['Use of English', 'Literature in English', 'Any Arts subject', 'Any Arts subject']),
          course('ba-philosophy', 'Philosophy', ['Use of English', 'Any Arts subject', 'Any Arts subject', 'Any Arts subject']),
          course('ba-religious-studies', 'Religious Studies', ['Use of English', 'CRS', 'Any Arts subject', 'Any Arts subject']),
        ],
      },
    ],
  },
  {
    id: 'communication-media-studies',
    name: 'Faculty of Communication and Media Studies',
    commonSubjectCombo: 'Use of English, Literature in English, Economics/Government/History, any other',
    departments: [
      {
        id: 'mass-communication-department',
        name: 'Department of Mass Communication',
        courses: [
          course('bsc-mass-communication', 'Mass Communication', [
            'Use of English', 'Literature in English', 'Economics/Government/History', 'Any other subject',
          ]),
        ],
      },
    ],
  },
  {
    id: 'education',
    name: 'Faculty of Education',
    commonSubjectCombo: 'Follows the teaching subject (e.g. Education & Biology = Use of English, Biology, Chemistry, any other)',
    departments: [
      {
        id: 'education-departments',
        name: 'Education Departments',
        courses: [
          course('bed-agricultural-science-education', 'Agricultural Science Education', [
            'Use of English', 'Biology/Agricultural Science', 'Chemistry', 'Any other subject',
          ]),
          course('bed-business-education', 'Business Education', ['Use of English', 'Mathematics', 'Economics', 'Any other subject']),
          course('bed-biology-education', 'Education and Biology', ['Use of English', 'Biology', 'Chemistry', 'Any other subject']),
          course('bed-chemistry-education', 'Education and Chemistry', ['Use of English', 'Chemistry', 'Biology/Physics', 'Any other subject']),
          course('bed-mathematics-education', 'Education and Mathematics', ['Use of English', 'Mathematics', 'Physics', 'Any other subject']),
          course('bed-physics-education', 'Education and Physics', ['Use of English', 'Physics', 'Mathematics', 'Any other subject']),
          course('bed-technical-education', 'Technical Education', ['Use of English', 'Mathematics', 'Physics', 'Any other subject']),
          course('bed-educational-administration-management', 'Educational Administration / Management', [
            'Use of English', 'Any other subject', 'Any other subject', 'Any other subject',
          ]),
        ],
      },
    ],
  },
  {
    id: 'environmental-sciences',
    name: 'Faculty of Environmental Sciences',
    commonSubjectCombo: 'Mathematics/Physics for built environment, Biology/Chemistry for others',
    departments: [
      {
        id: 'environmental-sciences-departments',
        name: 'Environmental Sciences Departments',
        courses: [
          course('barch-architecture', 'Architecture', ['Use of English', 'Mathematics', 'Physics', 'Any other subject']),
          course('besm-estate-management', 'Estate Management', ['Use of English', 'Mathematics', 'Economics', 'Any other subject']),
          course('bsc-quantity-surveying', 'Quantity Surveying', ['Use of English', 'Mathematics', 'Physics', 'Any other subject']),
          course('burp-urban-regional-planning', 'Urban and Regional Planning', ['Use of English', 'Mathematics', 'Geography/Economics', 'Any other subject']),
          course('bsc-environmental-management', 'Environmental Management', ['Use of English', 'Biology/Chemistry', 'Geography', 'Any other subject']),
          course('bsc-land-surveying', 'Land Surveying', ['Use of English', 'Mathematics', 'Physics', 'Any other subject']),
        ],
      },
    ],
  },
];

export function findCourseById(courseId: string): { faculty: Faculty; department: Department; course: Course } | null {
  for (const faculty of RSU_FACULTIES) {
    for (const department of faculty.departments) {
      const found = department.courses.find((c) => c.id === courseId);
      if (found) return { faculty, department, course: found };
    }
  }
  return null;
}

export function allCourses(): { faculty: Faculty; department: Department; course: Course }[] {
  const out: { faculty: Faculty; department: Department; course: Course }[] = [];
  RSU_FACULTIES.forEach((faculty) => {
    faculty.departments.forEach((department) => {
      department.courses.forEach((c) => out.push({ faculty, department, course: c }));
    });
  });
  return out;
}
