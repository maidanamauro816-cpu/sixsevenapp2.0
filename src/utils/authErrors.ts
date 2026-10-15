/** Saca el texto de un error (los plugins nativos a veces devuelven objetos, no Error). */
export function errorText(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  const m = (err as { message?: unknown } | null)?.message;
  return typeof m === 'string' && m ? m : fallback;
}

/** Traduce errores típicos de Firebase/Google a algo que se pueda entender, sin ocultar el detalle. */
export function explainAuthError(msg: string): string {
  const l = msg.toLowerCase();
  let hint = '';
  if (l.includes('28444') || l.includes('developer console') || l.includes('developer_error')) {
    hint = 'Google no reconoce la firma de esta versión de la app. Falta registrar la huella SHA en Firebase o todavía no se propagó (puede tardar unos minutos).';
  } else if (l.includes('billing')) {
    hint = 'Firebase pide activar el plan Blaze (de pago por uso) para enviar SMS. Mientras tanto podés entrar con Google.';
  } else if (l.includes('not authorized') || l.includes('app-not-authorized') || l.includes('play integrity') || l.includes('sha-')) {
    hint = 'Firebase no autoriza esta app: revisá que estén cargadas las huellas SHA-1 y SHA-256, y que Play Integrity API esté activada.';
  } else if (l.includes('operation-not-allowed') || l.includes('disabled')) {
    hint = 'Este método de acceso no está activado en Firebase (Authentication → Método de acceso).';
  } else if (l.includes('too-many') || l.includes('blocked all requests')) {
    hint = 'Demasiados intentos desde este dispositivo. Esperá un rato y volvé a probar.';
  } else if (l.includes('network')) {
    hint = 'Problema de conexión. Revisá tu internet.';
  } else if (l.includes('cancel')) {
    return 'Cancelaste el inicio de sesión.';
  }
  return hint ? `${hint}\n\nDetalle: ${msg}` : msg;
}
