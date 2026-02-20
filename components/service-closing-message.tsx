'use client';

import { useTranslations } from 'next-intl';

interface ServiceClosingMessageProps {
  className?: string;
}

export function ServiceClosingMessage({ className }: ServiceClosingMessageProps) {
  const t = useTranslations('cancellationPolicy');

  return (
    <div className={className}>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center alert-low p-8 rounded-lg'>
          <h3 className='text-xl font-primary font-bold mb-3'>
            {t('closingTitle')}
          </h3>
          <p className='font-secondary leading-relaxed'>{t('closingText')}</p>
        </div>
      </div>
    </div>
  );
}
