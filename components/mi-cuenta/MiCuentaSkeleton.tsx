import { Skeleton } from '@/components/ui/skeleton';

export function MiCuentaSkeleton() {
  return (
    <div className='container mx-auto px-4 py-16 max-w-7xl'>
      <Skeleton className='h-9 w-48 mb-8 bg-gray-200' />

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
        {/* Sidebar skeleton */}
        <div className='lg:col-span-1'>
          <div className='bg-card p-6 rounded-lg border space-y-2'>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className='h-12 w-full bg-[#FBE8EA]'
              />
            ))}
          </div>
        </div>

        {/* Content skeleton - Course cards */}
        <div className='lg:col-span-3'>
          <Skeleton className='h-8 w-64 mb-6 bg-gray-200' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='bg-card rounded-lg border overflow-hidden'
              >
                <Skeleton className='h-48 w-full bg-[#FBE8EA]' />
                <div className='p-6 space-y-4'>
                  <Skeleton className='h-6 w-3/4 bg-gray-200' />
                  <Skeleton className='h-4 w-full bg-gray-200' />
                  <Skeleton className='h-4 w-full bg-gray-200' />
                  <Skeleton className='h-10 w-full bg-[#F7CBCB]' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
