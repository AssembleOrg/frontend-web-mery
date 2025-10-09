import { Skeleton } from "@/components/ui/skeleton";

export function VideoManagementSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Back Button */}
      <Skeleton className='h-6 w-40 mb-4' />

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-9 w-80 mb-2' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-12 w-40' />
      </div>

      {/* Video List */}
      <div className='space-y-4'>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
          >
            <div className='flex items-start gap-4'>
              {/* Thumbnail */}
              <Skeleton className='w-40 h-24 rounded flex-shrink-0' />

              {/* Content */}
              <div className='flex-1 space-y-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-6 w-64' />
                    <Skeleton className='h-4 w-full max-w-lg' />
                    <div className='flex gap-4'>
                      <Skeleton className='h-3 w-32' />
                      <Skeleton className='h-3 w-24' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Skeleton className='h-8 w-8 rounded' />
                    <Skeleton className='h-8 w-8 rounded' />
                    <Skeleton className='h-8 w-8 rounded' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

