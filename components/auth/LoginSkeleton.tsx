import { Skeleton } from '@/components/ui/skeleton';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export function LoginSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />
      <div className='container mx-auto px-4 py-16 max-w-md'>
        <div className='bg-card p-8 rounded-lg border'>
          <div className='text-center mb-8'>
            <Skeleton className='w-12 h-12 mx-auto rounded-full mb-4' />
            <Skeleton className='h-9 w-48 mx-auto mb-2' />
            <Skeleton className='h-5 w-64 mx-auto' />
          </div>
          <div className='space-y-6'>
            {/* Email Skeleton */}
            <div>
              <Skeleton className='h-5 w-20 mb-2' />
              <Skeleton className='h-12 w-full' />
            </div>
            {/* Password Skeleton */}
            <div>
              <Skeleton className='h-5 w-32 mb-2' />
              <Skeleton className='h-12 w-full' />
            </div>
            {/* Submit Button Skeleton */}
            <Skeleton className='h-14 w-full' />
          </div>
          {/* Links Skeleton */}
          <div className='mt-6 text-center space-y-2'>
            <Skeleton className='h-5 w-72 mx-auto' />
            <Skeleton className='h-5 w-64 mx-auto' />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
