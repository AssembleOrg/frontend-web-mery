export interface CourseModalContent {
  videoId?: string;
  detailedDescription: string;
  duration?: string;
  level?: string;
  includes?: string[];
  requirements?: string[];
}

export interface Course {
  id: number;
  title: string;
  image: string;
  price: string;
  description: string;
  long_description?: string; // Prioridad sobre modalContent.detailedDescription
  target?: string; // Prioridad sobre modalContent.targetAudience
  modalContent?: CourseModalContent;
}