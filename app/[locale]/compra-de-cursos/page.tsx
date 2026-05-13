'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, ShoppingBag, Loader2, Landmark } from 'lucide-react';
import { useState } from 'react';
import { BankTransferModal } from '@/components/bank-transfer-modal';

const TRANSFER_DISCOUNT_PERCENT = 20;
// Convención del sistema (ver components/simple-course-modal.tsx,
// app/[locale]/formaciones/page.tsx): priceARS === 99999999 marca un curso
// USD-only (Nanoblading, Camuflaje Senior). El backend del cart suma estos
// sentinels en totalARS, así que recalculamos localmente para que el chip
// y los totales reflejen solo lo realmente pagable en pesos.
const USD_ONLY_SENTINEL = 99999999;

export default function CompraPage() {
  const router = useRouter();
  const { cart, removeItem, clear, isLoading, itemCount, totalUSD } = useCart();
  const [bankModal, setBankModal] = useState<'ARS' | 'USD' | null>(null);

  const arsPayableTotal = (cart?.items ?? []).reduce(
    (sum, item) => (item.priceARS === USD_ONLY_SENTINEL ? sum : sum + item.priceARS),
    0
  );
  const transferARS = Math.round(arsPayableTotal * (1 - TRANSFER_DISCOUNT_PERCENT / 100));

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
                  <div className='flex-shrink-0 w-24 h-24'>
                    <Image
                      src={
                        item.category.image ||
                        '/formacion/nanoblading-exclusive.webp'
                      }
                      alt={item.category.name}
                      width={96}
                      height={96}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  </div>

                  <div className='flex-1'>
                    <h3 className='text-lg font-primary font-bold text-foreground mb-2'>
                      {item.category.name}
                    </h3>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {item.category.description}
                    </p>
                    <p className='text-2xl font-primary font-bold text-[#f9bbc4] mb-4'>
                      {item.priceARS === USD_ONLY_SENTINEL
                        ? `USD ${item.priceUSD.toLocaleString('en-US')}`
                        : `$${item.priceARS.toLocaleString('es-AR')} ARS`}
                    </p>

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
                  <span>${arsPayableTotal.toLocaleString('es-AR')} ARS</span>
                </div>
                <div className='border-t pt-4'>
                  <div className='flex justify-between text-lg font-primary font-bold text-foreground'>
                    <span>Total</span>
                    <span>${arsPayableTotal.toLocaleString('es-AR')} ARS</span>
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

          {/* Transferencia bancaria — sección separada, sin fondo */}
          <div className='lg:col-span-3 border-t border-border pt-6'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
              <p className='text-muted-foreground text-sm flex-1'>
                ¿Preferís pagar por transferencia bancaria o PayPal? Obtené un{' '}
                <span className='text-[#660e1b] font-primary-medium'>{TRANSFER_DISCOUNT_PERCENT}% de descuento</span>{' '}
                pagando en pesos por transferencia. Copiá los datos y envianos el comprobante — activamos tu acceso en hasta 48hs hábiles.
              </p>
              <div className='flex flex-wrap gap-2 shrink-0'>
                {arsPayableTotal > 0 && (
                  <button
                    onClick={() => setBankModal('ARS')}
                    className='inline-flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white text-xs font-primary-medium pl-4 pr-2 py-2 rounded-full transition-all'
                  >
                    <Landmark className='w-3.5 h-3.5 text-[#f9bbc4]' />
                    <span>Pesos · ${transferARS.toLocaleString('es-AR')}</span>
                    <span className='ml-1.5 text-[10px] font-primary-medium tracking-wide bg-[#f9bbc4] text-[#660e1b] px-1.5 py-0.5 rounded-full'>
                      -{TRANSFER_DISCOUNT_PERCENT}%
                    </span>
                  </button>
                )}
                {totalUSD > 0 && (
                  <button
                    onClick={() => setBankModal('USD')}
                    className='inline-flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white text-xs font-primary-medium px-4 py-2.5 rounded-full transition-all'
                  >
                    <Landmark className='w-3.5 h-3.5 text-[#f9bbc4]' />
                    USD · ${totalUSD.toLocaleString('en-US')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <BankTransferModal
        isOpen={bankModal !== null}
        onClose={() => setBankModal(null)}
        currency={bankModal ?? 'ARS'}
        amount={
          bankModal === 'USD'
            ? `USD ${totalUSD.toLocaleString('en-US')}`
            : `$${transferARS.toLocaleString('es-AR')}`
        }
        listAmount={
          bankModal === 'ARS'
            ? `$${arsPayableTotal.toLocaleString('es-AR')}`
            : undefined
        }
        discountPercent={bankModal === 'ARS' ? TRANSFER_DISCOUNT_PERCENT : undefined}
      />
    </div>
  );
}
