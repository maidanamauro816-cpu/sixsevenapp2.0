export type SlotId = 'cube' | 'royal' | 'sweet';
export type SymbolId = '🍒'|'🍋'|'🍉'|'🍇'|'🍊'|'⭐'|'🃏'|'💎'|'👑'|'🍬'|'🐻'|'🍭';
export type SpinResult = { grid: SymbolId[][]; win: number; freeAwarded: number; bigWin: boolean; winningLines: number[] };

export const SYMBOLS: SymbolId[] = ['🍒','🍋','🍉','🍇','🍊','⭐','🃏','💎','👑','🍬','🐻','🍭'];
export const SLOT_INFO = {
 cube: { title:'CUBOLOCO 7', subtitle:'CARAS CÓSMICAS', rows:3, colors:['#ff4b8b','#ffbf46','#52e8ff'], icons:['🍒','🍋','🍉','🍇','🍊','⭐','🃏','💎'] as SymbolId[] },
 royal: { title:'REYES DEL BRILLO', subtitle:'TRONO DE FORTUNA', rows:4, colors:['#ffd36a','#ff8b42','#9b70ff'], icons:['👑','💎','🍊','🍇','⭐','🃏','🍒','🍋'] as SymbolId[] },
 sweet: { title:'DULCE NEBULOSA', subtitle:'BOSQUE DE CARAMELOS', rows:5, colors:['#b66cff','#63ffae','#ff76d2'], icons:['🍬','🐻','🍭','🍒','🍋','⭐','🃏','💎'] as SymbolId[] }
} as const;

// Twenty fixed left-to-right paylines, represented as row indices for the first 3 rows.
// Additional rows remain decorative lanes on 4/5-row games; wins are evaluated across
// the 20 official 3-row paylines so each theme shares one transparent ruleset.
export const PAYLINES: number[][] = [
[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
[0,0,1,0,0],[2,2,1,2,2],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],
[2,1,1,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,2,0,2,0],[2,0,2,0,2],
[0,2,2,2,0],[2,0,0,0,2],[0,0,2,0,0],[2,2,0,2,2],[0,1,0,1,0]
];
const WEIGHTS: Record<SymbolId,number> = {'🍒':18,'🍋':18,'🍉':15,'🍇':14,'🍊':14,'⭐':8,'🃏':4,'💎':4,'👑':2,'🍬':10,'🐻':8,'🍭':10};
const PAY: Partial<Record<SymbolId,number>> = {'🍒':2,'🍋':2,'🍉':3,'🍇':3,'🍊':3,'⭐':5,'💎':8,'👑':12,'🍬':3,'🐻':5,'🍭':4,'🃏':10};
const pick = (): SymbolId => {
 const total = Object.values(WEIGHTS).reduce((a,b)=>a+b,0);
 let r = Math.random()*total;
 for (const s of SYMBOLS) { r -= WEIGHTS[s]; if (r <= 0) return s; }
 return '🍒';
};
export function spinSlot(slot: SlotId, bet: number, multiplier = 1, rtp = 0.96): SpinResult {
 const rows = SLOT_INFO[slot].rows;
 const grid: SymbolId[][] = Array.from({length:rows},()=>Array.from({length:5},pick));
 // RTP is a configurable simulation tuning target: it adjusts wild frequency, never guarantees a return.
 const wildChance = Math.max(0.01, Math.min(0.12, 0.04 + (rtp-0.96)*0.6));
 for (let c=0;c<5;c++) for(let r=0;r<rows;r++) if(Math.random()<wildChance) grid[r][c]='🃏';
 let win=0; const winningLines:number[]=[];
 PAYLINES.forEach((line,index)=>{
  const seq=line.map((row,col)=>grid[row][col]);
  const first=seq.find(s=>s!=='🃏') ?? '🃏';
  let count=0;
  for(const s of seq){ if(s===first||s==='🃏') count++; else break; }
  if(count>=3){
   const pay=(PAY[first]??4) * (count===3?1:count===4?3:8);
   win += Math.round((bet/20)*pay*multiplier);
   winningLines.push(index+1);
  }
 });
 const scatters=grid.flat().filter(s=>s==='⭐').length;
 const freeAwarded=scatters>=3?5+(scatters-3)*2:0;
 return {grid,win,freeAwarded,bigWin:win>=6000,winningLines};
}
export const clampBet=(n:number)=>Math.max(50,Math.min(5000,Math.round(n/10)*10));
