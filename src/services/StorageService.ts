import { STORAGE_ENABLED, STORAGE_PROVIDER } from '../config/storage.config';
import { uploadToBackblaze, type BackblazeUploadKind } from './backblazeUpload';

export type LocalMediaRecord = { id:string; name:string; mimeType:string; dataUrl:string; createdAt:number; kind:'photo'|'video'|'audio'|'status' };
const DB_NAME='sixseven-local-media'; const STORE='media';
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(!('indexedDB' in window)){reject(new Error('Este dispositivo no soporta almacenamiento local'));return;}const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export const StorageService={
  isRemoteEnabled:()=>STORAGE_ENABLED,
  provider:()=>STORAGE_PROVIDER,
  async saveLocal(file:File,kind:LocalMediaRecord['kind']='photo'):Promise<LocalMediaRecord>{const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});const record:LocalMediaRecord={id:crypto.randomUUID(),name:file.name,mimeType:file.type||'application/octet-stream',dataUrl,createdAt:Date.now(),kind};const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();return record;},
  async listLocal():Promise<LocalMediaRecord[]>{const db=await openDb();const records=await new Promise<LocalMediaRecord[]>((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result as LocalMediaRecord[]);req.onerror=()=>reject(req.error);});db.close();return records.sort((a,b)=>b.createdAt-a.createdAt);},
  async deleteLocal(id:string):Promise<void>{const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();},
  async upload(file:File,kind:BackblazeUploadKind='image'):Promise<string>{if(!STORAGE_ENABLED)throw new Error('El almacenamiento remoto está desactivado.');return uploadToBackblaze(file,kind);}
};
