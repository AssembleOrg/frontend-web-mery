'use client';

import { useState, useEffect } from 'react';
import { Course, CourseCreateInput, CourseIncludeItem, Lesson } from '@/types/course';
import { ChevronLeft, ChevronRight, Save, Eye } from 'lucide-react';
import { BasicInfoStep } from './course-form-steps/basic-info-step';
import { ModalContentStep } from './course-form-steps/modal-content-step';
import { LessonsStep } from './course-form-steps/lessons-step';
import { PreviewStep } from './course-form-steps/preview-step';

interface CourseFormProps {
  course?: Course;
  onSubmit: (courseData: CourseCreateInput) => void;
  onCancel: () => void;
}

export default function CourseForm({ course, onSubmit, onCancel }: CourseFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CourseCreateInput>>({
    slug: course?.slug || '',
    title: course?.title || '',
    description: course?.description || '',
    image: course?.image || '',
    price: course?.price || 0,
    priceDisplay: course?.priceDisplay || '',
    currency: course?.currency || 'ARS',
    isPublished: course?.isPublished ?? false,
    modalContent: course?.modalContent || {
      detailedDescription: '',
      includes: [],
      targetAudience: '',
      specialNotes: '',
      additionalInfo: '',
      duration: '',
      level: '',
    },
    lessons: course?.lessons || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Información Básica', component: BasicInfoStep },
    { number: 2, title: 'Contenido del Modal', component: ModalContentStep },
    { number: 3, title: 'Lecciones', component: LessonsStep },
    { number: 4, title: 'Vista Previa', component: PreviewStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title?.trim()) newErrors.title = 'El título es requerido';
      if (!formData.slug?.trim()) newErrors.slug = 'El slug es requerido';
      if (!formData.description?.trim()) newErrors.description = 'La descripción es requerida';
      if (!formData.price || formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
      if (!formData.image?.trim()) newErrors.image = 'La imagen es requerida';
    }

    if (step === 2) {
      if (!formData.modalContent?.detailedDescription?.trim()) {
        newErrors.detailedDescription = 'La descripción detallada es requerida';
      }
      if (!formData.modalContent?.targetAudience?.trim()) {
        newErrors.targetAudience = 'El público objetivo es requerido';
      }
    }

    if (step === 3) {
      if (!formData.lessons || formData.lessons.length === 0) {
        newErrors.lessons = 'Debes agregar al menos una lección';
      }
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
      for (let i = 1; i <= 3; i++) {
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

  const updateModalContent = (updates: Partial<CourseCreateInput['modalContent']>) => {
    setFormData((prev) => ({
      ...prev,
      modalContent: {
        ...prev.modalContent!,
        ...updates,
      },
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
          updateModalContent={updateModalContent}
          updateLessons={updateLessons}
          errors={errors}
        />
      </div>

      {/* Navigation Buttons */}
      <div className='flex justify-between items-center bg-white rounded-lg shadow-lg p-6'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
        >
          Cancelar
        </button>

        <div className='flex gap-3'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={handlePrevious}
              className='inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
            >
              <ChevronLeft className='w-4 h-4' />
              Anterior
            </button>
          )}

          {currentStep < steps.length && (
            <button
              type='button'
              onClick={handleNext}
              className='inline-flex items-center gap-2 px-6 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors'
            >
              Siguiente
              <ChevronRight className='w-4 h-4' />
            </button>
          )}

          {currentStep === steps.length && (
            <button
              type='button'
              onClick={handleSubmit}
              className='inline-flex items-center gap-2 px-6 py-2 bg-[#660e1b] hover:bg-[#4a0a14] text-white rounded-lg transition-colors shadow-lg hover:shadow-xl'
            >
              <Save className='w-4 h-4' />
              {course ? 'Actualizar Curso' : 'Crear Curso'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
