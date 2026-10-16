import React from 'react';
import { User } from 'lucide-react';

export const Avatar: React.FC<{ src?: string; name?: string; size?: number; className?: string }> = ({ src, name, size = 48, className = '' }) => (
  <div
    className={`rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    {src ? <img src={src} alt={name || ''} className="w-full h-full object-cover" /> : <User size={size * 0.45} className="text-neutral-600" />}
  </div>
);
