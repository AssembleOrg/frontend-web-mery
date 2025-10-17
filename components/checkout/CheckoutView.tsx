// components/checkout/CheckoutView.tsx
'use client';

import Image from 'next/image';
import { CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';
import type { Cart } from '@/lib/api-client';
import type { User as UserType } from '@/types/auth';

interface FormData {
  nombre: string;
  apellido: string;
  telefono: string;
  pais: string;
  ciudad: string;
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
}: CheckoutViewProps) => {
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
              <div className='mt-4'>
                <label className='block text-sm font-medium text-foreground mb-2 items-center gap-2'>
                  <Phone className='w-4 h-4 text-[#f9bbc4]' /> Teléfono *
                </label>
                <input
                  type='tel'
                  name='telefono'
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
                />
              </div>
            </div>

            {/* Location Information */}
            {/* <div className='bg-card p-6 rounded-lg border'>
              <h2 className='text-xl font-primary font-bold text-foreground mb-6 flex items-center gap-3'>
                <MapPin className='w-5 h-5 text-[#f9bbc4]' /> Ubicación
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    País
                  </label>
                  <select
                    name='pais'
                    value={formData.pais}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
                  >
                    <option value=''>Seleccionar país</option>
                    <option value='Argentina'>Argentina</option>
                    <option value='Brasil'>Brasil</option>
                    <option value='Chile'>Chile</option>
                    <option value='Uruguay'>Uruguay</option>
                    <option value='Paraguay'>Paraguay</option>
                    <option value='Bolivia'>Bolivia</option>
                    <option value='Otro'>Otro</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>
                    Ciudad
                  </label>
                  <input
                    type='text'
                    name='ciudad'
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
                  />
                </div>
              </div>
            </div> */}

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
                  : `Confirmar y Pagar - $${totalARS.toLocaleString('es-AR')}`}
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
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className='flex gap-4'
                >
                  <div className='flex-shrink-0 w-16 h-16'>
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
                      <span className='font-bold text-[#f9bbc4]'>
                        ${item.priceARS.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='border-t pt-4 space-y-2'>
              <div className='flex justify-between text-muted-foreground'>
                <span>Subtotal</span>
                <span>${totalARS.toLocaleString('es-AR')}</span>
              </div>
              <div className='flex justify-between text-lg font-primary font-bold text-foreground'>
                <span>Total</span>
                <span>${totalARS.toLocaleString('es-AR')}</span>
              </div>
            </div>
            <div className='mt-6 alert-high border rounded-lg p-4'>
              <p className='text-sm text-primary'>
                <strong className='text-primary'>¡Importante!</strong> Después
                de completar tu compra...
              </p>
              <ul className='text-sm text-primary mt-2 space-y-1'>
                <li className='text-primary'>• Email de confirmación</li>
                <li className='text-primary'>• Credenciales de acceso</li>
                <li className='text-primary'>
                  • Acceso inmediato a tus cursos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
