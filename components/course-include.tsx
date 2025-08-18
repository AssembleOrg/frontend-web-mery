import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface CourseIncludeProps {
  icon?: LucideIcon;
  iconImage?: string;
  text: string;
  className?: string;
}

export default function CourseInclude({ icon: Icon, iconImage, text, className = '' }: CourseIncludeProps) {
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
      <span className='text-sm font-medium text-[#2b2b2b] leading-relaxed'>{text}</span>
    </div>
  );
}