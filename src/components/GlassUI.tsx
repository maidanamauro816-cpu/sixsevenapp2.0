import React from 'react';
export const glassClassName='sx-glass-panel';
export const glassStyles=`.sx-glass-panel{background:rgba(8,8,10,.68);-webkit-backdrop-filter:blur(18px) saturate(145%);backdrop-filter:blur(18px) saturate(145%);border:1px solid rgba(255,255,255,.08);box-shadow:0 8px 32px rgba(0,0,0,.18)}@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){.sx-glass-panel{background:rgba(12,12,14,.96)}}`;
export const GlassUI:React.FC<React.PropsWithChildren<{className?:string;as?:'header'|'div'|'footer'}>>=({children,className='',as='div'})=>{const Tag=as;return <><style>{glassStyles}</style><Tag className={glassClassName+' '+className}>{children}</Tag></>};
export default GlassUI;