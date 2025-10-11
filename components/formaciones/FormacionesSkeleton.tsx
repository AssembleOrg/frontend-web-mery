import { Skeleton } from '@/components/ui/skeleton';

export function FormacionesSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Banner skeleton */}
      <section className='w-full'>
        <div className='container mx-auto px-4 max-w-7xl py-8'>
          <Skeleton className='w-full h-[400px] rounded-lg bg-[#FBE8EA]' />
        </div>
      </section>

      {/* Cards skeleton */}
      <section className='container mx-auto px-4 pb-16 py-8 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-lg shadow-md overflow-hidden'
            >
              <Skeleton className='h-48 w-full bg-[#FBE8EA]' />
              <div className='p-4 space-y-3'>
                <Skeleton className='h-4 w-3/4 bg-gray-200' />
                <Skeleton className='h-4 w-full bg-gray-200' />
                <Skeleton className='h-6 w-1/3 bg-gray-200' />
                <Skeleton className='h-10 w-full bg-[#F7CBCB]' />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
