import React from 'react';
import { Hourglass } from 'lucide-react';

export const ComingSoon: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col items-center justify-center px-10 text-center safe-top pb-24">
    <Hourglass size={40} className="text-[#ff2a2a] drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]" />
    <h1 className="mt-4 text-lg font-bold">{title}</h1>
    <p className="mt-1 text-sm text-neutral-400">{text}</p>
  </div>
);
