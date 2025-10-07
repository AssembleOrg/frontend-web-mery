import { Course, UserCourse, Lesson, CourseProgress } from '@/types/course';

/**
 * Mock course data for development
 * Replace with backend API when ready
 */
export const mockLessons: Record<string, Lesson[]> = {
  'tatuaje-cosmetico': [
    {
      id: 'lesson-1',
      title: 'Introducción',
      description: 'Conoce los fundamentos básicos del tatuaje cosmético',
      vimeoVideoId: 'dQw4w9WgXcQ',
      duration: '01:52',
      order: 1,
    },
    {
      id: 'lesson-2',
      title: 'Practica',
      description: 'Preparación del área de trabajo y protocolos de seguridad',
      vimeoVideoId: '826655207',
      duration: '03:50',
      order: 2,
    },
    {
      id: 'lesson-3',
      title: 'Piel y profundidad',
      description: 'Comprende los tipos de piel y profundidad de trabajo',
      vimeoVideoId: '869659871',
      duration: '05:23',
      order: 3,
    },
  ],
  'nanoblading-exclusive': [
    {
      id: 'lesson-4',
      title: 'Introducción',
      description: 'Técnica revolucionaria para cejas ultra naturales',
      vimeoVideoId: 'dQw4w9WgXcQ',
      duration: '01:52',
      order: 1,
    },
    {
      id: 'lesson-5',
      title: 'Practica',
      description: 'Preparación y protocolos específicos para nanoblading',
      vimeoVideoId: '826655207',
      duration: '03:50',
      order: 2,
    },
    {
      id: 'lesson-6',
      title: 'Piel y profundidad',
      description: 'Análisis específico para la técnica de nanoblading',
      vimeoVideoId: '869659871',
      duration: '05:23',
      order: 3,
    },
    {
      id: 'lesson-7',
      title: 'Dibujo y estructura',
      description: 'Técnicas de diseño y mapeo para nanoblading',
      vimeoVideoId: '898120707',
      duration: '04:04',
      order: 4,
    },
    {
      id: 'lesson-8',
      title: 'Colorimetría',
      description: 'Selección de pigmentos y teoría del color',
      vimeoVideoId: 'dQw4w9WgXcQ',
      duration: '05:53',
      order: 5,
    },
    {
      id: 'lesson-9',
      title: 'Preparación)',
      description: 'Preparación completa del equipo y anestesia',
      vimeoVideoId: '826655207',
      duration: '04:17',
      order: 6,
    },
    {
      id: 'lesson-10',
      title: 'Experiencia',
      description: 'Demostración práctica completa',
      vimeoVideoId: '869659871',
      duration: '15:11',
      order: 7,
    },
  ],
  microblading: [
    {
      id: 'lesson-11',
      title: 'Técnica Básica',
      description: 'Fundamentos del microblading tradicional',
      vimeoVideoId: '869659871',
      duration: '05:23',
      order: 1,
    },
    {
      id: 'lesson-12',
      title: 'Cuidados Post-Tratamiento',
      description: 'Protocolo de cuidados después del procedimiento',
      vimeoVideoId: '898120707',
      duration: '04:04',
      order: 2,
    },
  ],
};

// Cursos con lecciones integradas
export const mockCoursesWithLessons: Course[] = [
  {
    id: 'tatuaje-cosmetico',
    title: 'Curso de Tatuaje Cosmético',
    price: 1200,
    priceDisplay: '$1,200',
    image: '/formacion/nanoblading-exclusive.webp',
    slug: 'tatuaje-cosmetico',
    currency: 'USD',
    description:
      'Curso completo de tatuaje cosmético desde cero hasta nivel avanzado',
    lessons: mockLessons['tatuaje-cosmetico'],
    modalContent: {
      detailedDescription:
        'Aprende las técnicas más avanzadas de tatuaje cosmético con Mery García',
      includes: [
        { text: 'Kit completo de herramientas' },
        { text: 'Certificado internacional' },
        { text: 'Soporte 24/7' },
      ],
      targetAudience: 'Profesionales de la belleza',
      duration: '8 semanas',
      level: 'Principiante a Avanzado',
    },
  },
  {
    id: 'nanoblading-exclusive',
    title: 'Nanoblading Exclusive',
    price: 1500,
    priceDisplay: '$1,500',
    image: '/formacion/nanoblading-exclusive.webp',
    slug: 'nanoblading-exclusive',
    currency: 'USD',
    description:
      'Técnica exclusiva de nanoblading para resultados ultra naturales',
    lessons: mockLessons['nanoblading-exclusive'],
    modalContent: {
      detailedDescription:
        'Domina la técnica más avanzada de cejas con nanoblading',
      includes: [
        { text: 'Técnica exclusiva de Mery García' },
        { text: 'Kit premium incluido' },
        { text: 'Mentoring personalizado' },
      ],
      targetAudience: 'Profesionales con experiencia básica',
      duration: '6 semanas',
      level: 'Intermedio a Avanzado',
    },
  },
  {
    id: 'microblading',
    title: 'Microblading Clásico',
    price: 800,
    priceDisplay: '$800',
    image: '/formacion/microblading.webp',
    slug: 'microblading',
    currency: 'USD',
    description: 'Aprende la técnica clásica de microblading paso a paso',
    lessons: mockLessons['microblading'],
    modalContent: {
      detailedDescription:
        'Curso fundamental de microblading para principiantes',
      includes: [
        { text: 'Manual técnico completo' },
        { text: 'Kit básico de inicio' },
        { text: 'Grupo de práctica' },
      ],
      targetAudience: 'Principiantes sin experiencia previa',
      duration: '4 semanas',
      level: 'Principiante',
    },
  },
];

/**
 * Mock user progress for development
 * Replace with backend API when ready
 */
export const mockUserProgress: Record<string, CourseProgress> = {
  'tatuaje-cosmetico': {
    courseId: 'tatuaje-cosmetico',
    lessonsCompleted: ['lesson-1'],
    totalLessons: 3,
    progressPercentage: 33,
    lastAccessed: new Date('2024-08-20'),
  },
  'nanoblading-exclusive': {
    courseId: 'nanoblading-exclusive',
    lessonsCompleted: [],
    totalLessons: 2,
    progressPercentage: 0,
    lastAccessed: new Date('2024-08-15'),
  },
};

/**
 * Mock user enrolled courses for development
 * Replace with backend API when ready
 */
export const mockUserCourses: UserCourse[] = [
  {
    courseId: 'tatuaje-cosmetico',
    course: mockCoursesWithLessons[0],
    enrolledAt: new Date('2024-08-01'),
    progress: mockUserProgress['tatuaje-cosmetico'],
    hasAccess: true,
  },
  {
    courseId: 'nanoblading-exclusive',
    course: mockCoursesWithLessons[1],
    enrolledAt: new Date('2024-08-10'),
    progress: mockUserProgress['nanoblading-exclusive'],
    hasAccess: true,
  },
];

// Función helper para obtener curso por ID
export const getCourseById = (courseId: string): Course | undefined => {
  return mockCoursesWithLessons.find((course) => course.id === courseId);
};

// Función helper para obtener lecciones de un curso
export const getLessonsByCourseId = (courseId: string): Lesson[] => {
  return mockLessons[courseId] || [];
};
