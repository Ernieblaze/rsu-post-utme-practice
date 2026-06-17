export interface RevisionNote {
  title: string;
  content: string;
}

export interface RevisionSubject {
  id: string;
  name: string;
  description: string;
  color: string;
  notes: RevisionNote[];
}

export const revisionSubjects: RevisionSubject[] = [
  {
    id: 'english',
    name: 'English',
    description: 'Grammar, vocabulary, comprehension, stress and oral English.',
    color: 'from-blue-600 to-indigo-600',
    notes: [
      {
        title: 'Parts of speech',
        content:
          'Nouns name things, verbs show action, adjectives describe nouns, adverbs describe verbs, pronouns replace nouns, prepositions show relationships, conjunctions join words, and interjections express emotion.',
      },
      {
        title: 'Subject-verb agreement',
        content:
          'A singular subject takes a singular verb; a plural subject takes a plural verb. Watch out for phrases that come between the subject and the verb.',
      },
      {
        title: 'Tenses',
        content:
          'Present tense shows current action. Past tense shows completed action. Future tense shows action yet to happen. Perfect tenses link past and present.',
      },
      {
        title: 'Synonyms and antonyms',
        content:
          'A synonym has a similar meaning; an antonym has an opposite meaning. Use context clues to decide the best choice in a sentence.',
      },
      {
        title: 'Vowel sounds',
        content:
          'Long vowels sound like the letter name (e.g., /iː/ in eat). Short vowels have a shorter sound (e.g., /ɪ/ in sit). Diphthongs glide from one sound to another.',
      },
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Algebra, geometry, statistics and basic calculus.',
    color: 'from-emerald-600 to-teal-600',
    notes: [
      {
        title: 'Factorisation',
        content:
          'Look for common factors or use grouping. For example, x + y - ax - ay groups into (x + y)(1 - a).',
      },
      {
        title: 'Percentages',
        content:
          'Percentage error = (|measured - actual| / actual) × 100. Always check whether you need to round to significant figures.',
      },
      {
        title: 'Variation',
        content:
          'Direct variation: y = kx. Inverse variation: y = k/x. The constant k can be found using one pair of values.',
      },
      {
        title: 'Permutations',
        content:
          'The number of ways to arrange n different objects is n factorial (n!). For example, 7! = 7 × 6 × 5 × 4 × 3 × 2 × 1 = 5040.',
      },
      {
        title: 'Statistics graphs',
        content:
          'A histogram groups data into classes. A bar chart compares separate categories. A pie chart shows proportions of a whole.',
      },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Mechanics, electricity, magnetism and waves.',
    color: 'from-violet-600 to-purple-600',
    notes: [
      {
        title: 'Transformers',
        content:
          'Laminating the soft iron core reduces eddy currents and heat loss. Transformers work on alternating current only.',
      },
      {
        title: 'Radioactivity',
        content:
          'Natural radioactivity is a nuclear process unaffected by temperature, pressure or electric and magnetic fields. Alpha, beta and gamma are the main radiations.',
      },
      {
        title: 'Electromagnetic force',
        content:
          "A current-carrying wire in a magnetic field experiences a force described by Fleming's left-hand rule (motor rule).",
      },
      {
        title: 'X-rays',
        content:
          'X-rays have very short wavelengths, making them useful for studying crystal structures through diffraction.',
      },
      {
        title: 'RLC circuits',
        content:
          'Impedance Z = √(R² + (XL - XC)²). At resonance XL = XC and the current is maximum.',
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    description: 'Atomic structure, periodic table, organic and physical chemistry.',
    color: 'from-rose-600 to-pink-600',
    notes: [
      {
        title: 'Amphoteric oxides',
        content:
          'Amphoteric oxides react with both acids and alkalis to form salts and water. Examples include aluminium oxide and zinc oxide.',
      },
      {
        title: 'Discovery of radioactivity',
        content:
          'Henri Becquerel discovered radioactivity in 1896 when uranium salts fogged photographic plates.',
      },
      {
        title: 'Atmospheric layers',
        content:
          'The thermosphere lies roughly 75 km to 400 km above Earth. Temperatures increase with altitude due to absorption of solar radiation.',
      },
      {
        title: 'Nitrogen preparation',
        content:
          'On an industrial scale, nitrogen is obtained by fractional distillation of liquid air, which also yields oxygen and argon.',
      },
      {
        title: 'Sulphur allotropes',
        content:
          'Rhombic sulphur forms when a solution of sulphur in carbon disulphide evaporates slowly. It has a stable octahedral crystal shape.',
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    description: 'Cells, genetics, human physiology and ecology.',
    color: 'from-lime-600 to-green-600',
    notes: [
      {
        title: 'Sensory receptors',
        content:
          'Mechanoreceptors respond to pressure, chemoreceptors to chemicals, photoreceptors to light and thermoreceptors to temperature.',
      },
      {
        title: 'Blood sugar regulation',
        content:
          'Insulin lowers blood glucose by increasing uptake into cells. Glucagon raises blood glucose by stimulating glycogen breakdown.',
      },
      {
        title: 'Skin layers',
        content:
          'The epidermis is the outer layer. Its topmost part, the cornified or stratum corneum, consists of flat dead cells that protect the body.',
      },
      {
        title: 'Taste and smell',
        content:
          'Both the tongue and the nose contain chemoreceptors that detect chemical stimuli, allowing us to taste and smell.',
      },
      {
        title: 'Blood groups',
        content:
          'Group O is the universal donor because it has no A or B antigens on red blood cells. Group AB is the universal recipient.',
      },
    ],
  },
  {
    id: 'current-affairs',
    name: 'Nigeria Current Affairs',
    description: 'Government, history, important dates and national institutions.',
    color: 'from-amber-500 to-orange-600',
    notes: [
      {
        title: 'Separation of powers',
        content:
          'The executive, legislature and judiciary each have separate powers and check one another to prevent abuse.',
      },
      {
        title: 'ICAO',
        content:
          'The International Civil Aviation Organisation sets global standards for aviation safety, security and environmental protection.',
      },
      {
        title: 'Sultan of Sokoto',
        content:
          "The Sultan of Sokoto is the spiritual leader of Nigerian Muslims. The current Sultan is Muhammadu Sa'ad Abubakar III.",
      },
      {
        title: 'ECOMOG',
        content:
          'The Economic Community of West African States Monitoring Group (ECOMOG) is a peacekeeping force established by ECOWAS.',
      },
      {
        title: 'Mount Kilimanjaro',
        content:
          'Located in Tanzania, Mount Kilimanjaro is the highest mountain in Africa at about 5,895 metres above sea level.',
      },
    ],
  },
];
