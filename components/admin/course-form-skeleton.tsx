import { Skeleton } from '@/components/ui/skeleton';

export function CourseFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Back Button Skeleton */}
      <Skeleton className='h-6 w-48' />

      {/* Page Header Skeleton */}
      <div>
        <Skeleton className='h-9 w-64 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Progress Steps Skeleton */}
      <div className='max-w-5xl mx-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className='flex-1 flex items-center'
              >
                <div className='flex items-center flex-1'>
                  <Skeleton className='w-10 h-10 rounded-full' />
                  <div className='ml-3 flex-1'>
                    <Skeleton className='h-4 w-32' />
                  </div>
                </div>
                {index < 2 && <Skeleton className='h-0.5 flex-1 mx-4' />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content Skeleton */}
        <div className='bg-white rounded-lg shadow-lg p-8 mb-6'>
          <div className='space-y-6'>
            <div>
              <Skeleton className='h-8 w-64 mb-4' />
              <Skeleton className='h-4 w-96 mb-6' />
            </div>

            {/* Form Fields */}
            {[...Array(4)].map((_, index) => (
              <div key={index}>
                <Skeleton className='h-4 w-32 mb-2' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}

            {/* Textarea Field */}
            <div>
              <Skeleton className='h-4 w-32 mb-2' />
              <Skeleton className='h-32 w-full' />
            </div>

            {/* Checkbox Field */}
            <div className='flex items-center gap-3'>
              <Skeleton className='h-5 w-5 rounded' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>
        </div>

        {/* Navigation Buttons Skeleton */}
        <div className='flex justify-between items-center bg-white rounded-lg shadow-lg p-6'>
          <Skeleton className='h-10 w-24' />
          <div className='flex gap-3'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-32' />
          </div>
        </div>
      </div>
    </div>
  );
}
