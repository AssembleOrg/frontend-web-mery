'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function CartIcon() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=/${locale}/finalizar-compra`);
      return;
    }
    router.push(`/${locale}/finalizar-compra`);
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className='relative p-2 hover:bg-muted rounded-lg transition-colors'
      aria-label='Carrito de compras'
    >
      <ShoppingCart className='w-6 h-6 text-foreground' />
      {itemCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-[#f9bbc4] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
          {itemCount}
        </span>
      )}
    </button>
  );
}

