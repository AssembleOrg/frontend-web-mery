'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';

export default function CompraPage() {
  const router = useRouter();
  const { cart, removeItem, clear, isLoading, itemCount, totalARS } = useCart();

  const handleContinueShopping = () => {
    router.push('/es/formaciones');
  };

  const handleCheckout = () => {
    router.push('/es/finalizar-compra');
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    await clear();
  };

  // Loading state
  if (isLoading && !cart) {
    return (
      <div className='min-h-screen bg-background'>
        <Navigation />
        <div className='container mx-auto px-4 py-16 max-w-4xl'>
          <div className='text-center'>
            <Loader2 className='w-24 h-24 mx-auto text-muted-foreground mb-6 animate-spin' />
            <p className='text-muted-foreground'>Cargando carrito...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className='min-h-screen bg-background'>
        <Navigation />
        <div className='container mx-auto px-4 py-16 max-w-4xl'>
          <div className='text-center'>
            <ShoppingBag className='w-24 h-24 mx-auto text-muted-foreground mb-6' />
            <h1 className='text-3xl font-primary font-bold text-foreground mb-4'>
              Tu carrito está vacío
            </h1>
            <p className='text-muted-foreground mb-8'>
              ¡Explora nuestros cursos y agrega algunos a tu carrito!
            </p>
            <button
              onClick={handleContinueShopping}
              className='bg-[#f9bbc4] hover:bg-[#eba2a8] text-white px-8 py-3 rounded-lg font-primary font-bold transition-colors duration-200'
            >
              Ver Formaciones
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <div className='container mx-auto px-4 py-16 max-w-6xl'>
        <h1 className='text-3xl font-primary font-bold text-foreground mb-8'>
          Carrito de Compras
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items */}
          <div className='lg:col-span-2 space-y-4'>
            {cart.items.map((item) => (
              <div
                key={item.id}
                className='bg-card p-6 rounded-lg border shadow-sm'
              >
                <div className='flex gap-4'>
                  {/* Course Image */}
                  <div className='flex-shrink-0 w-24 h-24'>
                    <Image
                      src={item.category.image || '/formacion/nanoblading-exclusive.webp'}
                      alt={item.category.name}
                      width={96}
                      height={96}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  </div>

                  {/* Course Details */}
                  <div className='flex-1'>
                    <h3 className='text-lg font-primary font-bold text-foreground mb-2'>
                      {item.category.name}
                    </h3>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {item.category.description}
                    </p>
                    <p className='text-2xl font-primary font-bold text-[#f9bbc4] mb-4'>
                      ${item.priceARS.toLocaleString('es-AR')} ARS
                    </p>

                    {/* Remove Button */}
                    <div className='flex items-center justify-end'>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className='text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2'
                        disabled={isLoading}
                      >
                        <Trash2 className='w-5 h-5' />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-card p-6 rounded-lg border shadow-sm sticky top-6'>
              <h2 className='text-xl font-primary font-bold text-foreground mb-6'>
                Resumen del Pedido
              </h2>

              <div className='space-y-4 mb-6'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>
                    Subtotal ({itemCount} curso{itemCount > 1 ? 's' : ''})
                  </span>
                  <span>${totalARS.toLocaleString('es-AR')} ARS</span>
                </div>
                <div className='border-t pt-4'>
                  <div className='flex justify-between text-lg font-primary font-bold text-foreground'>
                    <span>Total</span>
                    <span>${totalARS.toLocaleString('es-AR')} ARS</span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <button
                  onClick={handleCheckout}
                  className='w-full bg-[#660e1b] hover:bg-[#4a0a14] text-white py-3 px-6 rounded-lg font-primary font-bold transition-colors duration-200'
                >
                  Finalizar Compra
                </button>

                <button
                  onClick={handleContinueShopping}
                  className='w-full bg-[#f9bbc4] hover:bg-[#eba2a8] text-white py-2 px-6 rounded-lg font-primary font-medium transition-colors duration-200'
                >
                  Seguir Comprando
                </button>

                <button
                  onClick={handleClearCart}
                  className='w-full text-muted-foreground hover:text-foreground py-2 text-sm transition-colors duration-200'
                  disabled={isLoading}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
