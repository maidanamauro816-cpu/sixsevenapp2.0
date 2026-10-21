/**
 * Formato de temas de los mods tipo Delta/YoWhatsApp: un archivo SharedPreferences de Android.
 *   <map>
 *     <boolean name="..." value="true" />
 *     <int name="..." value="-16777216" />
 *     <string name="...">texto</string>
 *   </map>
 * (verificado con un tema real .xml de YoWhatsApp). Las claves que Six Seven no entiende se conservan
 * tal cual para poder volver a exportar el tema sin perder datos.
 */
export type PrefType = 'boolean' | 'int' | 'long' | 'float' | 'string';
export interface PrefValue { t: PrefType; v: boolean | number | string }
export type PrefMap = Record<string, PrefValue>;

const decode = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
const encode = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const attr = (tag: string, name: string): string | null => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`).exec(tag);
  return m ? decode(m[2] ?? m[3] ?? '') : null;
};

export function parseThemeXml(xml: string): PrefMap {
  const text = xml.replace(/^﻿/, '');
  if (!/<map[\s>]/.test(text)) throw new Error('No es un tema en formato <map> (Delta / YoWhatsApp).');
  const body = text.replace(/<!--[\s\S]*?-->/g, '');
  const out: PrefMap = {};
  const re = /<(boolean|int|long|float|string)\b([^>]*?)(\/>|>([\s\S]*?)<\/\1\s*>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const type = m[1] as PrefType;
    const name = attr(m[2], 'name');
    if (!name) continue;
    if (type === 'string') {
      const v = attr(m[2], 'value') ?? decode(m[4] ?? '');
      out[name] = { t: 'string', v };
      continue;
    }
    const raw = attr(m[2], 'value');
    if (raw === null) continue;
    if (type === 'boolean') out[name] = { t: 'boolean', v: raw === 'true' };
    else {
      const n = Number(raw);
      if (Number.isNaN(n)) continue;
      out[name] = { t: type, v: n };
    }
  }
  if (!Object.keys(out).length) throw new Error('El tema no tiene ninguna preferencia reconocible.');
  return out;
}

export function serializeThemeXml(map: PrefMap): string {
  const lines = ["<?xml version='1.0' encoding='utf-8' standalone='yes' ?>", '<map>'];
  for (const [name, { t, v }] of Object.entries(map)) {
    if (t === 'string') {
      const s = String(v);
      lines.push(s === '' ? `    <string name="${encode(name)}"></string>` : `    <string name="${encode(name)}">${encode(s)}</string>`);
    } else {
      lines.push(`    <${t} name="${encode(name)}" value="${String(v)}" />`);
    }
  }
  lines.push('</map>', '');
  return lines.join('\n');
}

/** Color Android (entero ARGB con signo) → #rrggbb y alfa 0..255. */
export function argbToParts(n: number): { hex: string; alpha: number } {
  const u = n >>> 0;
  const alpha = (u >>> 24) & 255;
  const hex = '#' + [(u >>> 16) & 255, (u >>> 8) & 255, u & 255].map((x) => x.toString(16).padStart(2, '0')).join('');
  return { hex, alpha };
}
export function partsToArgb(hex: string, alpha = 255): number {
  const h = hex.replace('#', '').padEnd(6, '0').slice(0, 6);
  return ((alpha << 24) | parseInt(h, 16)) | 0;
}
export function argbToCss(n: number): string {
  const { hex, alpha } = argbToParts(n);
  if (alpha === 255) return hex;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${(alpha / 255).toFixed(3)})`;
}
