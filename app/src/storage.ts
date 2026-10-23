import AsyncStorage from '@react-native-async-storage/async-storage';
export type HistoryItem={id:string;at:number;slot:string;bet:number;win:number;balance:number;kind:string};
export type SavedState={balance:number;level:number;history:HistoryItem[];accepted:boolean;rtp:number};
const KEY='sixseven-slots-ars-v1';
export const DEFAULT_STATE:SavedState={balance:100000,level:1,history:[],accepted:false,rtp:0.96};
export async function loadState():Promise<SavedState>{
 try { const raw=await AsyncStorage.getItem(KEY); if(!raw)return DEFAULT_STATE; const parsed=JSON.parse(raw) as Partial<SavedState>; return {...DEFAULT_STATE,...parsed,history:Array.isArray(parsed.history)?parsed.history:[]}; }
 catch { return DEFAULT_STATE; }
}
export async function saveState(state:SavedState){try{await AsyncStorage.setItem(KEY,JSON.stringify(state));}catch{/* Keep current session playable if storage is unavailable. */}}
