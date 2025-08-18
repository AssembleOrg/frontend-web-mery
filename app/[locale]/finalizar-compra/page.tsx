'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useCartStore } from '@/stores/cart-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';

export default function FinalizarCompraPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    pais: '',
    ciudad: '',
  });

  const total = getTotal();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      alert('¡Compra procesada exitosamente! Te enviaremos un email con los detalles de acceso.');
      router.push('/es/mi-cuenta');
    }, 2000);
  };

  const isFormValid = formData.nombre && formData.apellido && formData.email && formData.telefono;

  if (items.length === 0) {
    return (
      <div className='min-h-screen bg-background'>
        <Navigation />
        <div className='container mx-auto px-4 py-16 max-w-4xl'>
          <div className='text-center'>
            <h1 className='text-3xl font-primary font-bold text-foreground mb-4'>
              No hay cursos en tu carrito
            </h1>
            <p className='text-muted-foreground mb-8'>
              Agrega algunos cursos antes de finalizar la compra.
            </p>
            <button
              onClick={() => router.push('/es/formaciones')}
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
          Finalizar Compra
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className='space-y-8'>
              {/* Personal Information */}
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
                  <label className='block text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-[#f9bbc4]' />
                    Email *
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className='w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
                  />
                </div>

                <div className='mt-4'>
                  <label className='block text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-[#f9bbc4]' />
                    Teléfono *
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
              <div className='bg-card p-6 rounded-lg border'>
                <h2 className='text-xl font-primary font-bold text-foreground mb-6 flex items-center gap-3'>
                  <MapPin className='w-5 h-5 text-[#f9bbc4]' />
                  Ubicación
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
              </div>

              {/* Payment Method */}
              <div className='bg-card p-6 rounded-lg border'>
                <h2 className='text-xl font-primary font-bold text-foreground mb-6 flex items-center gap-3'>
                  <CreditCard className='w-5 h-5 text-[#f9bbc4]' />
                  Método de Pago
                </h2>

                <div className='bg-muted/50 p-4 rounded-lg'>
                  <p className='text-muted-foreground text-sm mb-2'>
                    Después de confirmar tu pedido, serás redirigido a la plataforma de pagos segura.
                  </p>
                  <div className='flex gap-4 text-sm text-muted-foreground'>
                    <span>• Transferencia bancaria</span>
                    <span>• Tarjeta de crédito</span>
                    <span>• Efectivo (local)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={!isFormValid || isProcessing}
                className='w-full bg-[#660e1b] hover:bg-[#4a0a14] disabled:bg-muted disabled:text-muted-foreground text-white py-4 px-6 rounded-lg font-primary font-bold text-lg transition-colors duration-200'
              >
                {isProcessing ? 'Procesando...' : `Confirmar Pedido - $${total.toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className='bg-card p-6 rounded-lg border sticky top-6'>
              <h2 className='text-xl font-primary font-bold text-foreground mb-6'>
                Resumen del Pedido
              </h2>

              <div className='space-y-4 mb-6'>
                {items.map((item) => (
                  <div key={item.course.id} className='flex gap-4'>
                    <div className='flex-shrink-0 w-16 h-16'>
                      <Image
                        src={item.course.image}
                        alt={item.course.title}
                        width={64}
                        height={64}
                        className='w-full h-full object-cover rounded-lg'
                      />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-foreground'>{item.course.title}</h3>
                      <div className='flex justify-between items-center mt-1'>
                        <span className='text-sm text-muted-foreground'>
                          Cantidad: {item.quantity}
                        </span>
                        <span className='font-bold text-[#f9bbc4]'>
                          {item.course.priceDisplay}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className='border-t pt-4 space-y-2'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Subtotal</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-lg font-primary font-bold text-foreground'>
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <div className='mt-6 p-4 bg-[#f9bbc4]/10 rounded-lg border border-[#f9bbc4]'>
                <p className='text-sm text-foreground'>
                  <strong>¡Importante!</strong> Después de completar tu compra recibirás:
                </p>
                <ul className='text-sm text-muted-foreground mt-2 space-y-1'>
                  <li>• Email de confirmación</li>
                  <li>• Credenciales de acceso</li>
                  <li>• Acceso inmediato a tus cursos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}