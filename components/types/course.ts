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
  modalContent: CourseModalContent;
}