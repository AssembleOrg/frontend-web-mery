'use client';

import { FormEvent, useState } from 'react';
import { Headset, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProblemReportService } from '@/services/problem-report.service';

const countryCodes = [
  { value: '+54', label: '🇦🇷 +54' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+34', label: '🇪🇸 +34' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+55', label: '🇧🇷 +55' },
  { value: '+56', label: '🇨🇱 +56' },
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+598', label: '🇺🇾 +598' },
];

export default function ProblemReportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+54');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setEmail('');
    setCountryCode('+54');
    setPhone('');
    setDescription('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('El correo electrónico es requerido');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error('La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      setIsLoading(true);

      await ProblemReportService.create({
        email: email.trim(),
        phone: phone.trim() ? `${countryCode}${phone.trim()}` : undefined,
        description: description.trim(),
      });

      toast.success('Hemos recibido tu reporte. Te contactaremos a la brevedad.');
      setIsOpen(false);
      resetForm();
    } catch (_error) {
      toast.error('Ocurrió un problema al enviar el reporte. Intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='fixed bottom-5 right-5 z-[120] inline-flex items-center gap-2 rounded-full bg-[#2B2B2B] px-4 py-3 text-sm font-semibold text-[#FBE8EA] shadow-lg transition hover:bg-[#1f1f1f]'
      >
        <Headset className='h-4 w-4' />
        ¿Problemas?
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-[#2B2B2B]'>Reportar un problema</h3>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                aria-label='Cerrar'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>Correo electrónico</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='ejemplo@email.com'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#660e1b]'
                  required
                />
              </div>

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>Teléfono (opcional)</label>
                <div className='flex gap-2'>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className='w-24 rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-[#660e1b]'
                  >
                    {countryCodes.map((code) => (
                      <option key={code.value} value={code.value}>
                        {code.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='11 1234 5678'
                    className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#660e1b]'
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-700'>Descripción del problema</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Contanos qué pasó y en qué pantalla sucedió...'
                  rows={5}
                  minLength={10}
                  required
                  className='w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#660e1b]'
                />
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='inline-flex w-full items-center justify-center rounded-md bg-[#660e1b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4d0914] disabled:cursor-not-allowed disabled:opacity-70'
              >
                {isLoading ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
