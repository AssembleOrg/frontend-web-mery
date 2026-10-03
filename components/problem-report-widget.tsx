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

const labelClass = 'text-xs font-medium uppercase tracking-wider text-[#545454]';
const fieldClass =
  'rounded-xl bg-[#F4F4F4] px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#9A9A9A] focus:bg-white focus:ring-2 focus:ring-black';

export default function ProblemReportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+54');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
      {isPanelOpen && <div className='fixed inset-0 z-[119]' onClick={() => setIsPanelOpen(false)} />}

      <div className='fixed right-0 top-1/2 z-[120] flex -translate-y-1/2 items-center pointer-events-none'>
        <div
          aria-hidden={!isPanelOpen}
          className={`mr-[-8px] rounded-l-xl bg-white py-3 pl-3 pr-5 sm:py-4 sm:pl-4 sm:pr-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out ${
            isPanelOpen ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'
          }`}
        >
          <p className='mb-2 whitespace-nowrap text-xs text-[#2B2B2B] sm:mb-3 sm:text-sm'>¿Tuviste algún problema? Contanos</p>
          <button
            type='button'
            tabIndex={isPanelOpen ? 0 : -1}
            onClick={() => {
              setIsPanelOpen(false);
              setIsOpen(true);
            }}
            className='w-full rounded-lg bg-[#2B2B2B] px-3 py-2 text-xs font-semibold sm:px-4 sm:py-2.5 sm:text-sm text-white transition hover:bg-black active:scale-[0.98]'
          >
            Reportar problema
          </button>
        </div>

        <button
          type='button'
          aria-label='Ayuda'
          aria-expanded={isPanelOpen}
          onClick={() => setIsPanelOpen((v) => !v)}
          className='pointer-events-auto relative flex flex-col items-center gap-1.5 rounded-l-lg bg-black px-1.5 py-3 text-white shadow-lg transition-all duration-300 sm:gap-2 sm:rounded-l-xl sm:px-2.5 sm:py-4 sm:hover:px-3.5 select-none'
        >
          <span className='rotate-180 text-[10px] font-medium tracking-[0.2em] sm:text-xs [writing-mode:vertical-rl]'>AYUDA</span>
          <Headset
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${isPanelOpen ? 'rotate-0' : '-rotate-90'}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className='fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300 starting:opacity-0'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out starting:translate-y-4 starting:scale-95 starting:opacity-0 sm:p-8'
          >
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-xl font-semibold text-black'>Reportar un problema</h3>
                <p className='mt-1 text-sm text-[#545454]'>Te respondemos a la brevedad.</p>
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='rounded-full p-2 text-[#545454] transition hover:bg-black hover:text-white'
                aria-label='Cerrar'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-1.5'>
                <label className={labelClass}>Correo electrónico</label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='ejemplo@email.com'
                  className={`w-full ${fieldClass}`}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className={labelClass}>Teléfono (opcional)</label>
                <div className='flex gap-2'>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className={`w-28 ${fieldClass}`}
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
                    className={`min-w-0 flex-1 ${fieldClass}`}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className={labelClass}>Descripción del problema</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Contanos qué pasó y en qué pantalla sucedió...'
                  rows={5}
                  minLength={10}
                  required
                  className={`w-full resize-none ${fieldClass}`}
                />
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#2B2B2B] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
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
