import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { OWNER } from './CopyrightFooter';

const EMAIL = 'maidanamauro816@gmail.com';
const LAST_UPDATE = '30 de octubre de 2026';

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="mt-5 mb-1.5 text-sm font-bold text-red-400">{children}</h2>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="text-sm leading-relaxed text-neutral-300">{children}</p>;
const Li: React.FC<{ children: React.ReactNode }> = ({ children }) => <li className="text-sm leading-relaxed text-neutral-300">{children}</li>;

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
  <main className="fixed inset-0 z-[90] overflow-y-auto bg-black px-4 pb-10 pt-4 text-white">
    <header className="mb-2 flex items-center gap-3">
      <button type="button" onClick={onBack} aria-label="Volver" className="rounded-full border border-neutral-800 p-2"><ArrowLeft size={18} /></button>
      <div><h1 className="text-lg font-black">{title}</h1><p className="text-[11px] text-neutral-500">Última actualización: {LAST_UPDATE}</p></div>
    </header>
    <div className="mx-auto max-w-md">{children}</div>
  </main>
);

/** Términos del servicio de SixSeven. Documento propio de la app; no sustituye asesoría legal. */
export const TermsOfServiceView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Términos del servicio" onBack={onBack}>
    <P>SixSeven es una aplicación de mensajería desarrollada y operada por {OWNER}. Al crear una cuenta o usar la app, aceptás estos términos.</P>
    <H>1. Quién puede usar SixSeven</H>
    <P>Tenés que tener al menos 13 años. Sos responsable de la actividad de tu cuenta y de la veracidad de los datos que cargues (nombre, foto, número de teléfono o cuenta de Google).</P>
    <H>2. Qué podés hacer</H>
    <P>Usar la app para chatear, compartir fotos, videos, audios, estados y personalizar tu interfaz. No está permitido:</P>
    <ul className="ml-4 list-disc space-y-1">
      <Li>Enviar contenido ilegal, de odio, acoso, explotación de menores o que suplante a otra persona.</Li>
      <Li>Usar la app para enviar spam, malware o intentar vulnerar su funcionamiento o el de otros usuarios.</Li>
      <Li>Acceder a cuentas de otras personas sin autorización.</Li>
    </ul>
    <H>3. Contenido del usuario</H>
    <P>Vos sos dueño de lo que enviás. Al enviarlo, nos das el permiso técnico necesario para almacenarlo y transmitirlo entre los participantes del chat (ver Política de Privacidad). Podemos eliminar contenido que viole estos términos.</P>
    <H>4. Funciones Premium</H>
    <P>Las funciones marcadas como "Premium" o de pago que veas en la app son, por ahora, una interfaz de demostración: no se realiza ningún cobro real ni se desbloquea una función efectiva hasta que se indique lo contrario de forma explícita.</P>
    <H>5. Disponibilidad del servicio</H>
    <P>SixSeven depende de servicios externos (Firebase, Backblaze, Cloudflare, Google Gemini). Puede haber interrupciones, pérdida de datos o cambios en las funciones sin aviso previo. El servicio se ofrece "tal cual", sin garantías de disponibilidad continua.</P>
    <H>6. Suspensión de cuentas</H>
    <P>Podemos suspender o eliminar cuentas que incumplan estos términos o la ley aplicable.</P>
    <H>7. Cambios</H>
    <P>Estos términos pueden actualizarse. Los cambios importantes se reflejarán en la fecha de "Última actualización" de esta pantalla.</P>
    <H>8. Contacto</H>
    <P>Para consultas sobre estos términos: <a href={`mailto:${EMAIL}`} className="text-red-400 underline">{EMAIL}</a>.</P>
  </Shell>
);

/** Política de privacidad de SixSeven: qué datos se guardan y dónde. */
export const PrivacyPolicyView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Shell title="Política de privacidad" onBack={onBack}>
    <P>Esta política explica qué datos guarda SixSeven, dónde y por qué.</P>
    <H>1. Datos que recopilamos</H>
    <ul className="ml-4 list-disc space-y-1">
      <Li><b>Cuenta:</b> número de teléfono o datos básicos de tu cuenta de Google (nombre, correo, foto) al iniciar sesión, gestionados por Firebase Authentication.</Li>
      <Li><b>Perfil:</b> nombre de usuario, foto de perfil y, si la cargás, foto de portada.</Li>
      <Li><b>Mensajes:</b> el texto y los metadatos de tus chats (quién lo envía, cuándo) se guardan en Firestore para poder mostrártelos. Solo los participantes de un chat pueden leerlo, según las reglas del servidor.</Li>
      <Li><b>Multimedia:</b> fotos, videos, audios y stickers que envíes se suben a Backblaze B2 a través de un servicio intermediario (Cloudflare Worker) que verifica tu sesión antes de cada subida.</Li>
      <Li><b>SixSeven IA:</b> si usás el asistente, tu mensaje se envía a Google Gemini para generar la respuesta. No se usa para entrenar modelos de terceros por fuera de lo que Google defina en su propia política.</Li>
      <Li><b>Preferencias de la interfaz:</b> el tema, la fuente, el tamaño de letra y ajustes similares se guardan únicamente en tu dispositivo (no en el servidor).</Li>
    </ul>
    <H>2. Qué NO hacemos</H>
    <P>No vendemos tus datos. No leemos tus chats salvo que sea necesario para investigar abuso reportado o por obligación legal.</P>
    <H>3. Con quién se comparte</H>
    <P>Tus datos se comparten únicamente con los proveedores que hacen funcionar la app: Google Firebase (autenticación y base de datos), Backblaze B2 y Cloudflare (almacenamiento de archivos) y Google Gemini (solo si usás la IA). Cada uno procesa los datos según sus propias políticas de privacidad.</P>
    <H>4. Cuánto tiempo se guardan</H>
    <P>Tus mensajes y archivos se conservan mientras tu cuenta exista. Los estados se borran automáticamente a las 24 horas, como en WhatsApp.</P>
    <H>5. Tus derechos</H>
    <P>Podés pedir que eliminemos tu cuenta y tus datos escribiendo a <a href={`mailto:${EMAIL}`} className="text-red-400 underline">{EMAIL}</a>. Vas a poder borrar fotos, mensajes y tu cuenta desde la propia app a medida que se agreguen esas opciones.</P>
    <H>6. Menores de edad</H>
    <P>SixSeven no está dirigida a menores de 13 años. Si creés que un menor de esa edad cargó datos, escribinos para eliminarlos.</P>
    <H>7. Contacto</H>
    <P>Dudas sobre esta política: <a href={`mailto:${EMAIL}`} className="text-red-400 underline">{EMAIL}</a>.</P>
  </Shell>
);
