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
 * Normaliza el número al formato E.164 que exige Firebase.
 * En Argentina Firebase requiere +549 para móviles. Acepta números locales
 * (con o sin 0/15) y números internacionales que empiecen por +54.
 */
export function normalizePhone(input: string, countryCode: string): PhoneResult {
  const raw = input.trim();
  let digits = raw.replace(/\D/g, '');
  if (!digits) return { ok: false, error: 'Escribí tu número de teléfono.' };

  // Argentina: normalizar también los números escritos completos con +54.
  // El +54 sin el 9 es un formato frecuente, pero Firebase necesita +549 para móviles.
  if (countryCode === '54' && raw.startsWith('+54')) {
    digits = digits.slice(2); // quitar 54
    digits = digits.replace(/^0+/, '');
    if (digits.startsWith('9') && digits.length === 11) digits = digits.slice(1);
    if (digits.length !== 10) {
      return {
        ok: false,
        error: 'Revisá el número argentino: código de área + número, sin 0 ni 15. Ej: +54 9 376 4624386.',
      };
    }
    return { ok: true, e164: `+549${digits}` };
  }

  // Para otros países, un número ya escrito con "+" se conserva como internacional.
  if (raw.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15
      ? { ok: true, e164: `+${digits}` }
      : { ok: false, error: 'El número con "+" parece incompleto. Revisalo.' };
  }

  if (countryCode === '54') {
    if (digits.startsWith('54')) digits = digits.slice(2);
    digits = digits.replace(/^0+/, '');
    if (digits.startsWith('9') && digits.length === 11) digits = digits.slice(1);

    // Quitar "15" cuando el usuario lo escribe como prefijo local.
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

  // Otros países: quitar prefijo nacional 0 y evitar duplicar el código de país.
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
