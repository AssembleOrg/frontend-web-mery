import { Skeleton } from '@/components/ui/skeleton';

export function CursoPlayerSkeleton() {
  return (
    <div className='min-h-screen bg-[#1a1a1a]'>
      {/* Header skeleton */}
      <div className='bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a]'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <Skeleton className='h-6 w-6 mb-6 bg-[#3d3d3d]' />
          <div className='text-center'>
            <Skeleton className='h-16 w-32 mx-auto mb-4 bg-[#F7CBCB]' />
            <Skeleton className='h-4 w-48 mx-auto bg-[#3d3d3d]' />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className='px-4 py-8'>
        <div className='w-full max-w-7xl mx-auto'>
          <div className='flex flex-col xl:flex-row gap-8'>
            {/* Video player skeleton */}
            <div className='flex-1'>
              <Skeleton className='aspect-video w-full mb-8 bg-[#2d2d2d]' />
              <div className='space-y-4'>
                <Skeleton className='h-8 w-3/4 bg-[#2d2d2d]' />
                <Skeleton className='h-20 w-full bg-[#2d2d2d]' />
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className='w-full xl:w-80'>
              <div className='bg-[#2d2d2d] rounded-lg border border-gray-700 p-4'>
                <Skeleton className='h-6 w-32 mb-4 bg-[#F7CBCB]' />
                <div className='space-y-2'>
                  {[...Array(6)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className='h-16 w-full bg-[#3d3d3d]'
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
