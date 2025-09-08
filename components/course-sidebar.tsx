'use client';

import React from 'react';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { Course, Lesson } from '@/types/course';

interface CourseSidebarProps {
  course: Course;
  selectedLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  progressPercentage: number;
  totalLessons: number;
  className?: string;
}

export default function CourseSidebar({
  course,
  selectedLesson,
  onLessonSelect,
  isLessonCompleted,
  progressPercentage,
  totalLessons,
  className = ""
}: CourseSidebarProps) {
  return (
    <div className={`bg-[#2d2d2d] rounded-lg shadow-xl border border-gray-700 ${className}`}>
      {/* Header del curso */}
      <div className="p-4 border-b border-gray-600">
        <h2 className="text-sm font-medium text-white mb-1">
          {course.title}
        </h2>
        <p className="text-xs text-gray-400">
          {totalLessons} Videos
        </p>
      </div>
      
      {/* Lista de videos */}
      <div className="max-h-96 overflow-y-auto">
        {course.lessons?.map((lesson, index) => {
          const isCompleted = isLessonCompleted(course.id, lesson.id);
          const isSelected = selectedLesson?.id === lesson.id;
          
          return (
            <button
              key={lesson.id}
              onClick={() => onLessonSelect(lesson)}
              className={`w-full text-left p-4 border-b border-gray-700 transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#f9bbc4]/20 border-l-4 border-l-[#f9bbc4]' 
                  : 'hover:bg-gray-600/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-[#f9bbc4] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  ) : (
                    <PlayCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isSelected ? 'text-white' : 'text-gray-300'
                  }`}>
                    {lesson.title}
                  </p>
                  {lesson.duration && (
                    <p className="text-xs text-gray-500 mt-1">
                      {lesson.duration}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progreso del curso */}
      <div className="p-4 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Progreso del curso</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div 
            className="bg-[#f9bbc4] h-1 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}