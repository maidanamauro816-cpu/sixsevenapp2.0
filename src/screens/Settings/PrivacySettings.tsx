import React from 'react';
import { SettingsShell, SectionTitle, SettingRow, Toggle } from './SettingsShared';
import { usePrivacySettings } from '../../contexts/PrivacyContext';

export const PrivacySettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const p = usePrivacySettings();
  const rows: [string, string, string][] = [
    ['Ocultar en línea', 'hideOnline', 'Preferencia local; para ocultarlo a otros debe respetarse también en presencia remota.'],
    ['Ocultar escribiendo…', 'hideTyping', 'La señal debe respetarse también en la lógica de mensajes.'],
    ['Ocultar grabando audio…', 'hideRecording', 'La señal debe respetarse también en la lógica de mensajes.'],
    ['Ocultar ticks azules', 'hideReadReceipts', 'Evita enviar confirmaciones de lectura cuando la lógica lo implemente.'],
    ['Ocultar segundo tick', 'hideDeliveryReceipts', 'Preferencia local de confirmaciones.'],
    ['Anti-borrado de mensajes', 'antiDeleteMessages', 'Solo puede conservar mensajes recibidos desde ahora si se guardan antes de borrarlos.'],
    ['Anti-borrado de estados', 'antiDeleteStatus', 'Preferencia local; requiere integración adicional con los estados remotos.'],
    ['Bloqueo local de chats', 'chatLock', 'La protección con PIN/biometría requiere implementar verificación segura.'],
  ];
  return <SettingsShell title="Privacidad" onBack={onBack}>
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400">
      Configuración disponible para todos los usuarios. Los controles que dependen del servidor necesitan integración adicional para aplicarse a otras cuentas.
    </div>
    <SectionTitle>QUIÉN PUEDE VER MIS ESTADOS</SectionTitle>
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <label htmlFor="status-audience" className="mb-2 block text-sm font-semibold">Audiencia de mis estados</label>
      <select id="status-audience" value={p.statusAudience} onChange={e => p.setStatusAudience(e.target.value as 'contacts'|'except'|'only')} className="w-full rounded-xl border border-neutral-700 bg-black p-3 text-sm text-white outline-none focus:border-red-500">
        <option value="contacts">Mis contactos</option>
        <option value="except">Mis contactos excepto…</option>
        <option value="only">Solo compartir con…</option>
      </select>
      {p.statusAudience !== 'contacts' && <>
        <label htmlFor="status-audience-list" className="mt-4 block text-xs text-neutral-400">{p.statusAudience === 'except' ? 'Contactos excluidos' : 'Contactos permitidos'}</label>
        <textarea id="status-audience-list" value={p.statusAudienceList} onChange={e => p.setStatusAudienceList(e.target.value)} rows={3} placeholder="Escribí los @usuarios separados por coma" className="mt-1 w-full rounded-xl border border-neutral-700 bg-black p-3 text-sm text-white outline-none focus:border-red-500"/>
        <p className="mt-2 text-[11px] text-neutral-500">Guardá los nombres de usuario separados por coma. Este ajuste queda disponible gratis; para imponerlo a otros usuarios debe validarse también al consultar los estados en Firestore.</p>
      </>}
      {p.statusAudience === 'contacts' && <p className="mt-2 text-[11px] text-neutral-500">Tus estados se configuran para tus contactos. Esta opción es gratuita, no requiere Premium.</p>}
    </div>
    <SectionTitle>PRIVACIDAD Y SEGURIDAD</SectionTitle>
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-3">
      {rows.map(([title, key, desc]) => <SettingRow key={key} title={title} subtitle={desc} right={<Toggle value={!!p[key as keyof typeof p]} onChange={v => p.setPrivacy(key, v)}/>} />)}
    </div>
  </SettingsShell>;
};
export default PrivacySettings;
