import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface CourseIncludeProps {
  icon?: LucideIcon;
  iconImage?: string;
  text: string;
  className?: string;
}

export default function CourseInclude({ icon: Icon, iconImage, text, className = '' }: CourseIncludeProps) {
  // Function to render text with bold support
  const renderTextWithBold = (inputText: string) => {
    const parts = inputText.split(/(\*\*[^*]+\*\*)/g);
    
    return (
      <span className='text-sm font-primary text-[#2b2b2b] leading-relaxed' style={{ fontWeight: 300 }}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
              <span key={index} className='font-primary-medium'>
                {boldText}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className={`flex items-center gap-3 p-4 bg-[#faf6f7] rounded-lg border border-[#f0e6e8] ${className}`}>
      <div className='flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#e9ecef]'>
        {iconImage ? (
          <Image
            src={iconImage}
            alt={text}
            width={32}
            height={32}
            className='w-8 h-8 object-contain'
          />
        ) : Icon ? (
          <Icon className='w-6 h-6 text-[#660e1b]' />
        ) : null}
      </div>
      {renderTextWithBold(text)}
    </div>
  );
}