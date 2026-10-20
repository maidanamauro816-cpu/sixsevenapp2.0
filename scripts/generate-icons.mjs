import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><filter id="g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ff2736"/></linearGradient></defs>
<rect width="512" height="512" rx="92" fill="#000"/><rect x="18" y="18" width="476" height="476" rx="78" fill="none" stroke="#ff1725" stroke-width="8" filter="url(#g)"/><rect x="31" y="31" width="450" height="450" rx="66" fill="none" stroke="#ff1725" stroke-opacity=".35" stroke-width="2"/>
<path d="M342 151c-28-24-61-36-101-36-75 0-126 39-126 99 0 54 41 78 119 95 55 12 73 23 73 45 0 24-25 39-64 39-43 0-80-16-111-47l-43 53c39 39 94 61 154 61 80 0 134-39 134-105 0-55-36-79-115-98-59-14-78-23-78-43 0-19 21-32 54-32 32 0 60 10 87 31z" fill="url(#s)" stroke="#ff1725" stroke-width="2" filter="url(#g)"/></svg>`);
await mkdir('public', { recursive: true });
await mkdir('assets', { recursive: true });
for (const [file, size] of [['public/icon-192x192.png',192],['public/icon-512x512.png',512],['public/icon-maskable-512x512.png',512],['public/apple-touch-icon.png',180],['assets/icon-only.png',1024],['assets/icon-foreground.png',1024]]) {
  await sharp(svg).resize(size,size,{fit:'contain',background:'#000'}).png().toFile(file);
}
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#000000' } }).png().toFile('assets/icon-background.png');
console.log('SixSeven official icons generated.');
