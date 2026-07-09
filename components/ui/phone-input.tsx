'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { COUNTRIES, countryFlag, type Country } from '@/lib/country-codes';

interface PhoneInputProps {
  value: string; // número completo, ej: "+54 91155551234"
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Input de teléfono con selector de país (banderas del mundo) y búsqueda.
 * Emite el número completo con código internacional: "+54 1155551234".
 */
export function PhoneInput({
  value,
  onChange,
  placeholder = 'Tu número (sin el código de país)',
  required,
  id,
  className = '',
}: PhoneInputProps) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Hidratar desde value externo (una sola vez, ej. al reabrir un draft)
  useEffect(() => {
    if (initializedRef.current || !value) return;
    initializedRef.current = true;
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => value.startsWith(c.dial));
    if (match) {
      setCountry(match);
      setLocalNumber(value.slice(match.dial.length).trim());
    } else {
      setLocalNumber(value);
    }
  }, [value]);

  // Cerrar al clickear afuera / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(search.trim());
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        normalizeSearch(c.name).includes(q) ||
        c.dial.replace('+', '').startsWith(q.replace('+', '')) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [search]);

  const emit = (c: Country, num: string) => {
    const cleaned = num.replace(/[^\d\s-]/g, '');
    onChange(cleaned.trim() ? `${c.dial} ${cleaned.trim()}` : '');
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    emit(c, localNumber);
  };

  const handleNumberChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d\s-]/g, '');
    setLocalNumber(cleaned);
    initializedRef.current = true;
    emit(country, cleaned);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className='flex gap-2'>
        {/* Selector de país */}
        <button
          type='button'
          onClick={() => setOpen((o) => !o)}
          className='flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex-shrink-0 text-sm'
          aria-label={`País: ${country.name} ${country.dial}`}
          aria-expanded={open}
        >
          <span className='text-lg leading-none'>{countryFlag(country.iso)}</span>
          <span className='text-gray-700 font-medium'>{country.dial}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Número */}
        <input
          id={id}
          type='tel'
          inputMode='tel'
          autoComplete='tel-national'
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className='flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
        />
      </div>

      {/* Dropdown de países */}
      {open && (
        <div className='absolute z-50 mt-1.5 left-0 right-0 sm:right-auto sm:w-80 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'>
          <div className='p-2 border-b border-gray-100'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                ref={searchInputRef}
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar país o código…'
                className='w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent'
              />
            </div>
          </div>
          <ul className='max-h-60 overflow-y-auto overscroll-contain py-1' role='listbox'>
            {filtered.length === 0 && (
              <li className='px-4 py-3 text-sm text-gray-400 text-center'>Sin resultados</li>
            )}
            {filtered.map((c) => (
              <li key={`${c.iso}-${c.dial}`}>
                <button
                  type='button'
                  onClick={() => selectCountry(c)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[#FBE8EA]/60 transition-colors ${
                    c.iso === country.iso ? 'bg-[#FBE8EA] text-[#660e1b]' : 'text-gray-700'
                  }`}
                  role='option'
                  aria-selected={c.iso === country.iso}
                >
                  <span className='text-lg leading-none'>{countryFlag(c.iso)}</span>
                  <span className='flex-1 truncate'>{c.name}</span>
                  <span className='text-gray-400 font-medium'>{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
