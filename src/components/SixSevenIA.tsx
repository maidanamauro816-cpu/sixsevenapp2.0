import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';

export const SixSevenIA: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{role:'user'|'system'; text:string}[]>([]);
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((old) => [...old, {role:'user', text}, {role:'system', text:'La pantalla de SixSeven IA está preparada. Para generar respuestas reales falta conectar el servicio de inteligencia artificial de forma segura.'}]);
    setMessage('');
  };
  return <div className="w-full max-w-md mx-auto min-h-screen bg-black text-white flex flex-col pb-24">
    <header className="sticky top-0 bg-black border-b border-neutral-900 px-4 py-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-[#ff1a1a] flex items-center justify-center shadow-[0_0_18px_rgba(255,26,26,.7)]"><Bot size={24} className="text-white"/></div>
      <div><h1 className="font-bold text-base">SixSeven IA</h1><p className="text-[11px] text-neutral-400">Asistente inteligente</p></div>
      <Sparkles size={19} className="ml-auto text-[#ff1a1a]"/>
    </header>
    <div className="flex-1 px-4 py-5 space-y-3">
      {messages.length===0 && <div className="mt-16 text-center px-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#ff1a1a] flex items-center justify-center shadow-[0_0_28px_rgba(255,26,26,.55)]"><Bot size={42}/></div>
        <h2 className="mt-5 text-xl font-bold">Hola, soy SixSeven IA</h2>
        <p className="mt-2 text-sm text-neutral-400">Esta es la pantalla de prueba del asistente. La conexión con el motor de IA todavía está pendiente.</p>
      </div>}
      {messages.map((m,i)=><div key={i} className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm whitespace-pre-wrap ${m.role==='user'?'ml-auto bg-[#b91020] text-white':'mr-auto bg-neutral-900 border border-neutral-800 text-neutral-200'}`}>{m.text}</div>)}
    </div>
    <div className="sticky bottom-20 bg-black px-3 py-3 border-t border-neutral-900">
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 focus-within:border-red-700">
        <input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}} placeholder="Escribí un mensaje para probar..." className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm text-white placeholder-neutral-500 outline-none"/>
        <button onClick={send} disabled={!message.trim()} aria-label="Enviar mensaje" className="w-10 h-10 shrink-0 rounded-xl bg-[#ff1a1a] text-white flex items-center justify-center disabled:opacity-40"><Send size={18}/></button>
      </div>
      <p className="text-[10px] text-neutral-600 text-center mt-2">Modo de prueba · conexión de IA pendiente</p>
    </div>
  </div>;
};
