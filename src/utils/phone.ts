export interface Country {
  code: string; // código de país sin "+"
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: '54', name: 'Argentina', flag: '🇦🇷' },
  { code: '595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '55', name: 'Brasil', flag: '🇧🇷' },
  { code: '56', name: 'Chile', flag: '🇨🇱' },
  { code: '591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '51', name: 'Perú', flag: '🇵🇪' },
  { code: '57', name: 'Colombia', flag: '🇨🇴' },
  { code: '58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '52', name: 'México', flag: '🇲🇽' },
  { code: '34', name: 'España', flag: '🇪🇸' },
  { code: '1', name: 'EE. UU. / Canadá', flag: '🇺🇸' },
];

export type PhoneResult = { ok: true; e164: string } | { ok: false; error: string };

/**
 * Convierte lo que escribe la persona al formato internacional (E.164) que pide Firebase.
 * Argentina: acepta 376 4624386, 0376 4624386, 0376 15 4624386, 54 9 376 4624386, +54 9 376 4624386.
 * Resultado para celulares argentinos: +549 + área + número (10 dígitos en total).
 */
export function normalizePhone(input: string, countryCode: string): PhoneResult {
  const raw = input.trim();
  let digits = raw.replace(/\D/g, '');
  if (!digits) return { ok: false, error: 'Escribí tu número de teléfono.' };

  // Si lo escribió completo con "+", se respeta tal cual.
  if (raw.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15
      ? { ok: true, e164: `+${digits}` }
      : { ok: false, error: 'El número con "+" parece incompleto. Revisalo.' };
  }

  if (countryCode === '54') {
    if (digits.startsWith('54')) digits = digits.slice(2); // lo escribió con 54
    digits = digits.replace(/^0+/, ''); // prefijo 0 del área
    if (digits.startsWith('9') && digits.length === 11) digits = digits.slice(1); // 54 9 ...
    // Quitar el "15" que se marca desde un fijo: 11 15 xxxxxxxx / 376 15 xxxxxxx / 2965 15 xxxxxx
    if (digits.length === 12) {
      for (const i of [2, 3, 4]) {
        if (digits.slice(i, i + 2) === '15') {
          digits = digits.slice(0, i) + digits.slice(i + 2);
          break;
        }
      }
    }
    if (digits.length !== 10) {
      return {
        ok: false,
        error: 'Revisá el número: código de área + número, sin 0 ni 15. Ej: 376 4624386 (10 dígitos).',
      };
    }
    return { ok: true, e164: `+549${digits}` };
  }

  // Otros países: se saca el 0 inicial y se antepone el código.
  if (digits.startsWith(countryCode) && digits.length > 10) digits = digits.slice(countryCode.length);
  digits = digits.replace(/^0+/, '');
  if (digits.length < 6 || digits.length > 13) {
    return { ok: false, error: 'El número no parece válido. Revisalo.' };
  }
  return { ok: true, e164: `+${countryCode}${digits}` };
}

/** Para mostrar: +5493764624386 -> +54 9 3764624386 */
export function prettyPhone(e164: string): string {
  const m = e164.match(/^\+549(\d{10})$/);
  return m ? `+54 9 ${m[1]}` : e164;
}
