'use client';

import { useState, useEffect } from 'react';
import { Course, CourseCreateInput, Lesson } from '@/types/course';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { BasicInfoStep } from './course-form-steps/basic-info-step';
import { LessonsStep } from './course-form-steps/lessons-step';
import { PreviewStep } from './course-form-steps/preview-step';

interface CourseFormProps {
  course?: Course;
  onSubmit: (courseData: CourseCreateInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CourseForm({ course, onSubmit, onCancel, isSubmitting = false }: CourseFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Map backend Category to frontend Course format
  const mapCourseData = (courseData: any): Partial<CourseCreateInput> => {
    if (!courseData) {
      return {
        slug: '',
        title: '',
        description: '',
        image: '',
        priceARS: 0,
        priceUSD: 0,
        isFree: false,
        isPublished: true, // Activo por default en nuevos cursos
        long_description: '',
        long_description_en: '',
        target: '',
        target_en: '',
        modalidad: '',
        modalidad_en: '',
        learn: '',
        learn_en: '',
        includes_category: [],
        includes_category_en: [],
        modalContent: {
          detailedDescription: '',
          includes: [],
          targetAudience: '',
          specialNotes: '',
          additionalInfo: '',
          duration: '',
          level: '',
        },
        lessons: [],
      };
    }

    return {
      slug: courseData.slug || '',
      title: courseData.title || courseData.name || '', // Backend uses 'name'
      description: courseData.description || '',
      image: courseData.image || '',
      priceARS: courseData.priceARS || 0,
      priceUSD: courseData.priceUSD || 0,
      isFree: courseData.isFree || false,
      isPublished: courseData.isPublished ?? courseData.isActive ?? false,
      order: courseData.order || 0,
      long_description: courseData.long_description || '',
      long_description_en: courseData.long_description_en || '',
      target: courseData.target || '',
      target_en: courseData.target_en || '',
      modalidad: courseData.modalidad || '',
      modalidad_en: courseData.modalidad_en || '',
      learn: courseData.learn || '',
      learn_en: courseData.learn_en || '',
      includes_category: courseData.includes_category || [],
      includes_category_en: courseData.includes_category_en || [],
      modalContent: courseData.modalContent || {
        detailedDescription: '',
        includes: [],
        targetAudience: '',
        specialNotes: '',
        additionalInfo: '',
        duration: '',
        level: '',
      },
      lessons: courseData.lessons || [],
    };
  };

  const [formData, setFormData] = useState<Partial<CourseCreateInput>>(mapCourseData(course));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update formData when course prop changes (important for async data loading)
  useEffect(() => {
    if (course) {
      setFormData(mapCourseData(course));
    }
  }, [course]);

  const steps = [
    { number: 1, title: 'Información Básica', component: BasicInfoStep },
    { number: 2, title: 'Lecciones', component: LessonsStep },
    { number: 3, title: 'Vista Previa', component: PreviewStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title?.trim()) newErrors.title = 'El título es requerido';
      if (!formData.slug?.trim()) newErrors.slug = 'El slug es requerido';
      if (!formData.description?.trim()) newErrors.description = 'La descripción es requerida';
      
      // Validar precios si no es gratuito
      if (!formData.isFree) {
        if (!formData.priceARS || formData.priceARS <= 0) {
          newErrors.priceARS = 'El precio en ARS debe ser mayor a 0';
        }
        if (!formData.priceUSD || formData.priceUSD <= 0) {
          newErrors.priceUSD = 'El precio en USD debe ser mayor a 0';
        }
      }
      
      if (!formData.image?.trim()) newErrors.image = 'La imagen es requerida';
    }

    if (step === 2) {
      // if (!formData.lessons || formData.lessons.length === 0) {
      //   newErrors.lessons = 'Debes agregar al menos una lección';
      // }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Validate all steps before submitting
      let isValid = true;
      for (let i = 1; i <= 2; i++) {
        if (!validateStep(i)) {
          isValid = false;
          setCurrentStep(i);
          break;
        }
      }

      if (isValid) {
        onSubmit(formData as CourseCreateInput);
      }
    }
  };

  const updateFormData = (updates: Partial<CourseCreateInput>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateLessons = (lessons: Lesson[]) => {
    setFormData((prev) => ({
      ...prev,
      lessons,
    }));
  };

  return (
    <div className='max-w-5xl mx-auto'>
      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          {steps.map((step, index) => (
            <div key={step.number} className='flex-1 flex items-center'>
              <div className='flex items-center flex-1'>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.number
                      ? 'border-[#660e1b] bg-[#660e1b] text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <div className='ml-3 flex-1'>
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-[#660e1b]' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 transition-colors ${
                    currentStep > step.number ? 'bg-[#660e1b]' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className='bg-white rounded-lg shadow-lg p-8 mb-6'>
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          updateLessons={updateLessons}
          errors={errors}
        />
      </div>

      {/* Navigation Buttons */}
      <div className='flex justify-between items-center bg-white rounded-lg shadow-lg p-6'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isSubmitting}
          className='px-6 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Cancelar
        </button>

        <div className='flex gap-3'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={handlePrevious}
              disabled={isSubmitting}
              className='inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='w-4 h-4' />
              Anterior
            </button>
          )}

          {currentStep < steps.length && (
            <button
              type='button'
              onClick={handleNext}
              disabled={isSubmitting}
              className='inline-flex items-center gap-2 px-6 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Siguiente
              <ChevronRight className='w-4 h-4' />
            </button>
          )}

          {currentStep === steps.length && (
            <button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='inline-flex items-center gap-2 px-6 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  {course ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className='w-4 h-4' />
                  {course ? 'Actualizar Curso' : 'Crear Curso'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
