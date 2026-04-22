// components/checkout/CheckoutView.tsx
'use client';

import Image from 'next/image';
import { CreditCard, User, Mail, Trash2, Gift, X, Loader2 } from 'lucide-react';
import type { Cart, ValidateCouponResponse } from '@/lib/api-client';
import type { User as UserType } from '@/types/auth';
import { toast } from 'react-hot-toast';

interface FormData {
  nombre: string;
  apellido: string;
}

interface CheckoutViewProps {
  cart: Cart;
  user: UserType | null;
  formData: FormData;
  isProcessing: boolean;
  isFormValid: boolean;
  error: string | null;
  totalARS: number;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onRemoveItem: (itemId: string) => Promise<boolean>;
  // Coupon props
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  appliedCoupon: ValidateCouponResponse | null;
  isValidatingCoupon: boolean;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  discountedTotalARS: number;
}

export const CheckoutView = ({
  cart,
  user,
  formData,
  isProcessing,
  isFormValid,
  error,
  totalARS,
  handleInputChange,
  handleSubmit,
  onRemoveItem,
  couponCode,
  onCouponCodeChange,
  appliedCoupon,
  isValidatingCoupon,
  onValidateCoupon,
  onRemoveCoupon,
  discountedTotalARS,
}: CheckoutViewProps) => {
  const handleRemoveItem = async (itemId: string) => {
    const success = await onRemoveItem(itemId);
    if (success) {
      toast.success('Curso eliminado del carrito');
    }
  };

  const discountAmount = totalARS - discountedTotalARS;
  const hasDiscount = appliedCoupon?.valid && discountAmount > 0;

  return (
    <div className='container mx-auto px-4 py-16 max-w-6xl'>
      <h1 className='text-3xl font-primary font-bold text-foreground mb-8'>
        Finalizar Compra
      </h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        <div>
          <form
            onSubmit={handleSubmit}
            className='space-y-8'
          >
            <div className='bg-card p-6 rounded-lg border'>
              <h2 className='text-xl font-primary font-bold text-foreground mb-6 flex items-center gap-3'>
                <User className='w-5 h-5 text-[#f9bbc4]' />
                Información Personal
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    Nombre *
                  </label>
                  <input
                    type='text'
                    name='nombre'
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    Apellido *
                  </label>
                  <input
                    type='text'
                    name='apellido'
                    value={formData.apellido}
                    onChange={handleInputChange}
                    required
                    className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
                  />
                </div>
              </div>
              <div className='mt-4'>
                <label className='text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                  <Mail className='w-4 h-4 text-[#f9bbc4]' /> Email
                </label>
                <input
                  type='email'
                  value={user?.email || ''}
                  disabled
                  className='w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  El acceso a los cursos será enviado a este email
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className='bg-card p-6 rounded-lg border'>
              <h2 className='text-xl font-primary font-bold text-foreground mb-6 flex items-center gap-3'>
                <CreditCard className='w-5 h-5 text-[#f9bbc4]' /> Método de Pago
              </h2>
              <div className='bg-muted/50 p-4 rounded-lg'>
                <p className='text-muted-foreground text-sm'>
                  Completa tus datos y haz clic en Confirmar y Pagar para ser
                  redirigido a la plataforma de pagos segura.
                </p>
              </div>
              <button
                type='submit'
                disabled={!isFormValid || isProcessing}
                className='w-full mt-6 bg-[#660e1b] hover:bg-[#4a0a14] disabled:bg-muted disabled:text-muted-foreground text-white py-4 px-6 rounded-lg font-primary font-bold text-lg transition-colors'
              >
                {isProcessing
                  ? 'Procesando...'
                  : `Confirmar y Pagar - $${discountedTotalARS.toLocaleString('es-AR')}`}
              </button>
              {error && (
                <p className='text-red-500 mt-2 text-center'>{error}</p>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className='bg-card p-6 rounded-lg border sticky top-6'>
            <h2 className='text-xl font-primary font-bold text-foreground mb-6'>
              Resumen del Pedido
            </h2>
            <div className='space-y-4 mb-6'>
              {cart.items.map((item) => {
                const isEligible = appliedCoupon?.valid &&
                  appliedCoupon.applicableCategoryIds.includes(item.category.id);
                const itemDiscount = isEligible
                  ? Math.round(item.priceARS * appliedCoupon.discountPercent / 100)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className='flex gap-4 items-start'
                  >
                    <div className='shrink-0 w-16 h-16'>
                      <Image
                        src={item.category.image || '/placeholder.png'}
                        alt={item.category.name}
                        width={64}
                        height={64}
                        className='w-full h-full object-cover rounded-lg'
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-foreground'>
                        {item.category.name}
                      </h3>
                      <div className='flex justify-between items-center mt-1'>
                        <span className='text-sm text-muted-foreground'>
                          Cantidad: 1
                        </span>
                        {isEligible ? (
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-muted-foreground line-through'>
                              ${item.priceARS.toLocaleString('es-AR')}
                            </span>
                            <span className='font-bold text-purple-600'>
                              ${(item.priceARS - itemDiscount).toLocaleString('es-AR')}
                            </span>
                          </div>
                        ) : (
                          <span className='font-bold text-[#f9bbc4]'>
                            ${item.priceARS.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                      {isEligible && (
                        <span className='text-xs text-purple-600 font-medium'>
                          -{appliedCoupon.discountPercent}% aplicado
                        </span>
                      )}
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemoveItem(item.id)}
                      className='shrink-0 p-1.5 text-muted-foreground hover:text-red-500 transition-colors'
                      aria-label={`Eliminar ${item.category.name}`}
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Coupon Section */}
            <div className='border-t pt-4 mb-4'>
              {appliedCoupon?.valid ? (
                <div className='flex items-center justify-between bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800'>
                  <div className='flex items-center gap-2'>
                    <Gift className='w-4 h-4 text-purple-600' />
                    <span className='text-sm font-medium text-purple-700 dark:text-purple-300'>
                      {appliedCoupon.couponCode}
                    </span>
                    <span className='text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium'>
                      -{appliedCoupon.discountPercent}%
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={onRemoveCoupon}
                    className='text-muted-foreground hover:text-red-500 transition-colors p-1'
                    aria-label='Quitar cupón'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div>
                  <div className='flex gap-2'>
                    <div className='relative flex-1'>
                      <Gift className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                      <input
                        type='text'
                        placeholder='Código de descuento'
                        value={couponCode}
                        onChange={(e) => onCouponCodeChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            onValidateCoupon();
                          }
                        }}
                        className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-purple-300 focus:border-transparent'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={onValidateCoupon}
                      disabled={!couponCode.trim() || isValidatingCoupon}
                      className='px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-muted disabled:text-muted-foreground text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2'
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        'Aplicar'
                      )}
                    </button>
                  </div>
                  {appliedCoupon && !appliedCoupon.valid && (
                    <p className='text-xs text-red-500 mt-1.5'>{appliedCoupon.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className='border-t pt-4 space-y-2'>
              <div className='flex justify-between text-muted-foreground'>
                <span>Subtotal</span>
                <span>${totalARS.toLocaleString('es-AR')}</span>
              </div>
              {hasDiscount && (
                <div className='flex justify-between text-purple-600'>
                  <span>Descuento ({appliedCoupon!.discountPercent}%)</span>
                  <span>-${discountAmount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className='flex justify-between text-lg font-primary font-bold text-foreground'>
                <span>Total</span>
                <span>${discountedTotalARS.toLocaleString('es-AR')}</span>
              </div>
            </div>
            <div className='mt-6 alert-high border border-[#f7cbcb] rounded-lg p-4'>
              <p className='text-sm'>
                <strong>¡Importante!</strong> Después de completar tu compra
                recibirás:
              </p>
              <ul className='text-sm mt-2 space-y-1'>
                <li>• Email de confirmación</li>
                <li>• Credenciales de acceso</li>
                <li>• Acceso inmediato a tus cursos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
