import { Skeleton } from "@/components/ui/skeleton";

export function CourseTableSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex justify-between items-center'>
        <div>
          <Skeleton className='h-9 w-64 mb-2' />
          <Skeleton className='h-4 w-80' />
        </div>
        <Skeleton className='h-12 w-48' />
      </div>

      {/* Table Skeleton */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3'>
                  <Skeleton className='h-4 w-20' />
                </th>
                <th className='px-6 py-3'>
                  <Skeleton className='h-4 w-24' />
                </th>
                <th className='px-6 py-3'>
                  <Skeleton className='h-4 w-24' />
                </th>
                <th className='px-6 py-3'>
                  <Skeleton className='h-4 w-20' />
                </th>
                <th className='px-6 py-3'>
                  <Skeleton className='h-4 w-20' />
                </th>
                <th className='px-6 py-3 text-right'>
                  <Skeleton className='h-4 w-20 ml-auto' />
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      <Skeleton className='h-12 w-12 rounded mr-4' />
                      <div className='space-y-2'>
                        <Skeleton className='h-4 w-48' />
                        <Skeleton className='h-3 w-64' />
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <Skeleton className='h-4 w-24' />
                  </td>
                  <td className='px-6 py-4'>
                    <Skeleton className='h-4 w-24' />
                  </td>
                  <td className='px-6 py-4'>
                    <Skeleton className='h-4 w-20' />
                  </td>
                  <td className='px-6 py-4'>
                    <Skeleton className='h-5 w-16 rounded-full' />
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Skeleton className='h-8 w-8 rounded' />
                      <Skeleton className='h-8 w-8 rounded' />
                      <Skeleton className='h-8 w-8 rounded' />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

