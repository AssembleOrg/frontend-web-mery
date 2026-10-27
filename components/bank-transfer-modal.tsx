'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const BANK_DATA = {
  ARS: {
    banco: 'Banco Galicia',
    titular: 'María Martha García Tello',
    cbu: '0070327530004085285623',
    alias: 'browboss',
    label: 'Transferencia en pesos',
  },
  USD: {
    banco: 'Banco Galicia',
    titular: 'María Marta García Tello',
    cbu: '0070327531004038543337',
    alias: 'Merygarcia.academia',
    label: 'Transferencia en dólares',
  },
} as const;

const WA_URL = 'https://wa.me/5491153336627';

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'ARS' | 'USD';
  amount?: string;
  listAmount?: string;
  discountPercent?: number;
  whatsappMessage?: string;
}

export const BankTransferModal = ({
  isOpen,
  onClose,
  currency,
  amount,
  listAmount,
  discountPercent,
  whatsappMessage,
}: BankTransferModalProps) => {
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const data = BANK_DATA[currency];

  useEffect(() => {
    if (!isOpen) { setCopied(false); setCopiedAmount(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyText = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div
      className='fixed inset-0 bg-black/75 z-[60] flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div
        className='bg-[#111111] rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 pt-5 pb-3'>
          <p className='text-[#f9bbc4] text-xs font-primary-medium uppercase tracking-widest'>
            {data.label}
          </p>
          <button
            onClick={onClose}
            className='text-white/30 hover:text-white/70 transition-colors'
            aria-label='Cerrar'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Amount */}
        {amount && (
          <div className='px-5 pb-4'>
            {discountPercent && listAmount && (
              <div className='flex items-center gap-2 mb-1'>
                <span className='text-white/40 text-sm line-through'>{listAmount}</span>
                <span className='text-[10px] font-primary-medium tracking-wide bg-[#f9bbc4] text-[#660e1b] px-1.5 py-0.5 rounded-full'>
                  -{discountPercent}%
                </span>
              </div>
            )}
            <div className='inline-flex items-center gap-2'>
              <p className='text-white text-4xl font-primary font-bold tracking-tight'>
                {amount}
              </p>
              <button
                onClick={() => copyText(amount.replace(/[^0-9.,]/g, ''), setCopiedAmount)}
                className='text-white/40 hover:text-[#f9bbc4] transition-colors mt-1'
                aria-label='Copiar monto'
              >
                {copiedAmount
                  ? <Check className='w-4 h-4 text-[#f9bbc4]' />
                  : <Copy className='w-4 h-4' />
                }
              </button>
            </div>
            {discountPercent && (
              <p className='text-[#f9bbc4] text-xs mt-1'>
                Incluye {discountPercent}% off por pago en transferencia
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className='mx-5 border-t border-white/8' />

        {/* Bank details */}
        <div className='px-5 py-4 space-y-3'>
          <div className='flex justify-between items-baseline'>
            <span className='text-white/60 text-xs uppercase tracking-widest'>Banco</span>
            <span className='text-white text-sm font-primary-medium'>{data.banco}</span>
          </div>
          <div className='flex justify-between items-baseline'>
            <span className='text-white/60 text-xs uppercase tracking-widest'>Titular</span>
            <span className='text-white text-sm font-primary-medium text-right max-w-[60%]'>{data.titular}</span>
          </div>
          <div className='flex justify-between items-baseline'>
            <span className='text-white/60 text-xs uppercase tracking-widest'>Alias</span>
            <span className='text-white text-sm font-primary-medium'>{data.alias}</span>
          </div>
          <div className='pt-1'>
            <p className='text-white/60 text-xs uppercase tracking-widest mb-1.5'>CBU</p>
            <p className='font-mono text-white/80 text-sm tracking-wider break-all leading-relaxed'>
              {data.cbu}
            </p>
          </div>
        </div>

        {/* Copy CBU button */}
        <div className='px-5 pb-3'>
          <button
            onClick={() => copyText(data.cbu, setCopied)}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-primary-medium text-sm transition-all duration-200 ${
              copied
                ? 'bg-[#f9bbc4] text-[#2b2b2b]'
                : 'bg-white text-[#111111] hover:bg-white/90'
            }`}
          >
            {copied ? (
              <>
                <Check className='w-4 h-4' />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className='w-4 h-4' />
                Copiar CBU
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className='mx-5 border-t border-white/8' />

        {/* Footer — comprobante */}
        <div className='px-5 py-4 space-y-3'>
          <p className='text-[#f9bbc4] text-xs leading-relaxed'>
            Una vez realizada la transferencia, enviá el comprobante al siguiente número de WhatsApp:{' '}
            <span className='text-white/70'>+5491153336627</span>. Las transferencias pueden tardar en impactar hasta{' '}
            <span className='text-white/70'>48 horas hábiles</span>, por lo que la habilitación del curso está sujeta a ese tiempo.
          </p>
          <a
            href={whatsappMessage ? `${WA_URL}?text=${encodeURIComponent(whatsappMessage)}` : WA_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2b2b2b] hover:bg-[#3a3a3a] text-white font-primary-medium text-sm transition-all duration-200 border border-white/8'
          >
            <FaWhatsapp className='w-4 h-4 text-[#f9bbc4]' />
            Enviar comprobante
          </a>
        </div>
      </div>
    </div>
  );
};
