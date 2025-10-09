import { Skeleton } from '@/components/ui/skeleton';

export function CheckoutSkeleton() {
  return (
    <div className='container mx-auto px-4 py-16 max-w-6xl'>
      <Skeleton className='h-10 w-1/3 mb-8' />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        <div className='space-y-8'>
          <div className='bg-card p-6 rounded-lg border'>
            <Skeleton className='h-7 w-48 mb-6' />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Skeleton className='h-5 w-24 mb-2' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div>
                <Skeleton className='h-5 w-24 mb-2' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
            <div className='mt-4'>
              <Skeleton className='h-5 w-20 mb-2' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='mt-4'>
              <Skeleton className='h-5 w-28 mb-2' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>

          {/* Skeleton para "Método de Pago" */}
          <div className='bg-card p-6 rounded-lg border'>
            <Skeleton className='h-7 w-56 mb-6' />
            <Skeleton className='h-16 w-full mb-6' />
            <Skeleton className='h-14 w-full' />
          </div>
        </div>

        {/* Columna del Resumen del Pedido */}
        <div>
          <div className='bg-card p-6 rounded-lg border sticky top-6'>
            <Skeleton className='h-7 w-64 mb-6' />
            <div className='space-y-4 mb-6'>
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className='flex gap-4 items-center'
                >
                  <Skeleton className='w-16 h-16 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                  </div>
                </div>
              ))}
            </div>
            <div className='border-t pt-4 space-y-3'>
              <div className='flex justify-between'>
                <Skeleton className='h-5 w-20' />
                <Skeleton className='h-5 w-24' />
              </div>
              <div className='flex justify-between'>
                <Skeleton className='h-7 w-16' />
                <Skeleton className='h-7 w-28' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
