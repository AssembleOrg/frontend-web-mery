// components/checkout/CheckoutView.tsx
'use client';

import Image from 'next/image';
import { CreditCard, User, Mail, Trash2, Gift, X, Loader2, Info } from 'lucide-react';
import type { Cart, ValidateCouponResponse } from '@/lib/api-client';
import type { User as UserType } from '@/types/auth';
import { toast } from 'react-hot-toast';

interface FormData {
  nombre: string;
  apellido: string;
}

export type InstallmentPlan = 3 | 6;

interface CheckoutViewProps {
  cart: Cart;
  user: UserType | null;
  formData: FormData;
  isProcessing: boolean;
  isFormValid: boolean;
  error: string | null;
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
  // Installment plan
  installmentPlan: InstallmentPlan;
  onInstallmentPlanChange: (plan: InstallmentPlan) => void;
  showInstallmentSelector: boolean;
  // IDs de items USD-only (se gestionan por fuera de MP)
  usdOnlyItemIds: string[];
  // Totales pre-calculados (solo items ARS)
  subtotalARS: number;
  couponDiscountARS: number;
  cuotasDiscountARS: number;
  finalTotalARS: number;
  totalAt6Cuotas: number;
  totalAt3Cuotas: number;
}

export const CheckoutView = ({
  cart,
  user,
  formData,
  isProcessing,
  isFormValid,
  error,
  handleInputChange,
  handleSubmit,
  onRemoveItem,
  couponCode,
  onCouponCodeChange,
  appliedCoupon,
  isValidatingCoupon,
  onValidateCoupon,
  onRemoveCoupon,
  installmentPlan,
  onInstallmentPlanChange,
  showInstallmentSelector,
  usdOnlyItemIds,
  subtotalARS,
  couponDiscountARS,
  cuotasDiscountARS,
  finalTotalARS,
  totalAt6Cuotas,
  totalAt3Cuotas,
}: CheckoutViewProps) => {
  const handleRemoveItem = async (itemId: string) => {
    const success = await onRemoveItem(itemId);
    if (success) {
      toast.success('Curso eliminado del carrito');
    }
  };

  const hasCouponDiscount = appliedCoupon?.valid && couponDiscountARS > 0;
  const hasCuotasDiscount = cuotasDiscountARS > 0;
  const usdOnlySet = new Set(usdOnlyItemIds);
  const hasUsdOnly = usdOnlySet.size > 0;
  const formatARS = (n: number) => `$${n.toLocaleString('es-AR')}`;

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

              {showInstallmentSelector && (
                <div className='mb-5'>
                  <p className='text-sm font-primary-medium text-foreground mb-3'>
                    Plan de cuotas sin interés
                  </p>
                  <div className='space-y-2'>
                    <InstallmentOption
                      selected={installmentPlan === 6}
                      onClick={() => onInstallmentPlanChange(6)}
                      title='6 cuotas sin interés'
                      subtitle='Precio de lista'
                      price={formatARS(totalAt6Cuotas)}
                    />
                    <InstallmentOption
                      selected={installmentPlan === 3}
                      onClick={() => onInstallmentPlanChange(3)}
                      title='3 cuotas sin interés'
                      subtitle='10% de descuento'
                      price={formatARS(totalAt3Cuotas)}
                      badge='-10%'
                    />
                  </div>
                  <div className='flex items-start gap-1.5 mt-2.5'>
                    <Info className='w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5' />
                    <p className='text-xs text-muted-foreground'>
                      El precio final varía según el plan elegido.
                    </p>
                  </div>
                </div>
              )}

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
                  : `Confirmar y Pagar - ${formatARS(finalTotalARS)}`}
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
                const isUsdOnly = usdOnlySet.has(item.id);
                const isEligible = !isUsdOnly && appliedCoupon?.valid &&
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
                        className={`w-full h-full object-cover rounded-lg ${isUsdOnly ? 'opacity-60' : ''}`}
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
                        {isUsdOnly ? (
                          <span className='font-bold text-[#f9bbc4]'>
                            USD {item.priceUSD.toLocaleString('en-US')}
                          </span>
                        ) : isEligible ? (
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
                      {isUsdOnly ? (
                        <span className='text-xs text-muted-foreground italic'>
                          Se coordina aparte por WhatsApp
                        </span>
                      ) : isEligible ? (
                        <span className='text-xs text-purple-600 font-medium'>
                          -{appliedCoupon.discountPercent}% aplicado
                        </span>
                      ) : null}
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
              {hasUsdOnly && (
                <div className='text-xs text-muted-foreground bg-muted/40 rounded-md p-3 border border-border'>
                  Los cursos en USD no se cobran por Mercado Pago — se gestionan por transferencia/WhatsApp y no participan del total de abajo.
                </div>
              )}
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
              <div className='flex justify-between text-[#660e1b]'>
                <span>Subtotal</span>
                <span>{formatARS(subtotalARS)}</span>
              </div>
              {hasCouponDiscount && (
                <div className='flex justify-between text-[#660e1b]'>
                  <span>Cupón ({appliedCoupon!.discountPercent}%)</span>
                  <span>-{formatARS(couponDiscountARS)}</span>
                </div>
              )}
              {hasCuotasDiscount && (
                <div className='flex justify-between text-[#660e1b]'>
                  <span>Plan 3 cuotas (-10%)</span>
                  <span>-{formatARS(cuotasDiscountARS)}</span>
                </div>
              )}
              <div className='flex justify-between text-lg font-primary font-bold text-[#660e1b]'>
                <span>Total</span>
                <span>{formatARS(finalTotalARS)}</span>
              </div>
            </div>
            <div className='mt-6 alert-high border rounded-lg p-4'>
              <p className='text-sm text-[#660e1b]'>
                <strong className='text-[#660e1b]'>¡Importante!</strong> Después
                de completar tu compra...
              </p>
              <ul className='text-sm text-[#660e1b] mt-2 space-y-1'>
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

interface InstallmentOptionProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: string;
  badge?: string;
}

const InstallmentOption = ({
  selected,
  onClick,
  title,
  subtitle,
  price,
  badge,
}: InstallmentOptionProps) => (
  <button
    type='button'
    onClick={onClick}
    aria-pressed={selected}
    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
      selected
        ? 'border-[#660e1b] bg-[#660e1b]/5'
        : 'border-border hover:border-[#f9bbc4] bg-background'
    }`}
  >
    <div className='flex items-center gap-3'>
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          selected ? 'border-[#660e1b]' : 'border-muted-foreground/40'
        }`}
      >
        {selected && <span className='w-2.5 h-2.5 rounded-full bg-[#660e1b]' />}
      </span>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <p className='font-primary-medium text-foreground'>{title}</p>
          {badge && (
            <span className='text-[10px] font-primary-medium tracking-wide bg-[#f9bbc4]/20 text-[#660e1b] px-1.5 py-0.5 rounded-full'>
              {badge}
            </span>
          )}
        </div>
        <p className='text-xs text-muted-foreground mt-0.5'>{subtitle}</p>
      </div>
      <p className='font-primary font-bold text-foreground shrink-0'>{price}</p>
    </div>
  </button>
);
