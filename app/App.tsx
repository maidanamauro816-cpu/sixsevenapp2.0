import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Alert,BackHandler,Pressable,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View} from 'react-native';
import {StatusBar as ExpoStatusBar} from 'expo-status-bar';
import {clampBet,SLOT_INFO,SlotId,spinSlot,SpinResult} from './src/slotEngine';
import {DEFAULT_STATE,HistoryItem,loadState,saveState,SavedState} from './src/storage';

const DISCLAIMER='Este juego es solo para mayores de 18 años con fines de entretenimiento. No se puede ganar dinero real ni canjear premios.';
const VIRTUAL='FICHAS VIRTUALES - SIN VALOR REAL - SOLO ENTRETENIMIENTO';
const money=(n:number)=>'$ '+Math.max(0,Math.round(n)).toLocaleString('es-AR');
const randomId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const BTN=({label,onPress,sub,style}:any)=><Pressable onPress={onPress} style={[styles.button,style]}><Text style={styles.buttonText}>{label}</Text>{sub?<Text style={styles.small}>{sub}</Text>:null}</Pressable>;

export default function App(){
 const [state,setState]=useState<SavedState>(DEFAULT_STATE);
 const [ready,setReady]=useState(false);
 const [slot,setSlot]=useState<SlotId>('cube');
 const [bet,setBet]=useState(150);
 const [result,setResult]=useState<SpinResult|null>(null);
 const [spinning,setSpinning]=useState(false);
 const [turbo,setTurbo]=useState(false);
 const [autoLeft,setAutoLeft]=useState(0);
 const [freeGames,setFreeGames]=useState(0);
 const [screen,setScreen]=useState<'game'|'paytable'|'settings'|'history'>('game');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const info=SLOT_INFO[slot];
 useEffect(()=>{loadState().then(s=>{setState(s);setReady(true)});},[]);
 useEffect(()=>{if(ready)void saveState(state)},[state,ready]);
 const record=useCallback((kind:string,win:number,charged:number)=>{
   setState(prev=>{
    const balance=Math.max(0,prev.balance-charged+win);
    const item:HistoryItem={id:randomId(),at:Date.now(),slot:SLOT_INFO[slot].title,bet:charged,win,balance,kind};
    return {...prev,balance,level:Math.max(prev.level,Math.floor((prev.history.length+1)/20)+1),history:[item,...prev.history].slice(0,250)};
   });
 },[slot]);
 const doSpin=useCallback((isAuto=false)=>{
  if(spinning)return;
  if(freeGames===0&&state.balance<bet){Alert.alert('Fichas insuficientes','Usá Recargar $ 50.000: es ilimitado y no tiene valor real.');setAutoLeft(0);return}
  setSpinning(true);
  const r=spinSlot(slot,bet,freeGames>0?2:1,state.rtp);
  setResult(r);
  const charged=freeGames>0?0:bet;
  record(freeGames>0?'FREE GAME':'GIRO',r.win,charged);
  if(freeGames>0)setFreeGames(n=>Math.max(0,n-1));
  if(r.freeAwarded>0){setFreeGames(n=>n+r.freeAwarded);Alert.alert('¡FREE GAMES!', 'Ganaste '+r.freeAwarded+' giros gratis con multiplicador x2.')}
  setTimeout(()=>setSpinning(false),turbo?120:650);
  if(r.win>=6000)Alert.alert('¡GANANCIA GRANDE!',money(r.win)+' fichas virtuales');
  if(isAuto)setAutoLeft(n=>Math.max(0,n-1));
 },[spinning,freeGames,state.balance,state.rtp,bet,slot,record,turbo]);
 useEffect(()=>{
  if(autoLeft>0&&!spinning){timer.current=setTimeout(()=>doSpin(true),turbo?180:850)}
  return()=>{if(timer.current)clearTimeout(timer.current)}
 },[autoLeft,spinning,doSpin,turbo]);
 useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(screen!=='game'){setScreen('game');return true}if(autoLeft){setAutoLeft(0);return true}return false});return()=>sub.remove()},[screen,autoLeft]);
 const reload=()=>{setState(p=>({...p,balance:p.balance+50000,history:[{id:randomId(),at:Date.now(),slot:info.title,bet:0,win:50000,balance:p.balance+50000,kind:'RECARGA VIRTUAL'},...p.history].slice(0,250)}))};
 const changeSlot=(s:SlotId)=>{setSlot(s);setResult(null);setScreen('game');setAutoLeft(0)};
 const startAuto=(n:number)=>{setAutoLeft(n);if(!spinning)doSpin(true)};
 const grid=result?.grid??Array.from({length:info.rows},()=>Array.from({length:5},()=>info.icons[Math.floor(Math.random()*info.icons.length)]));
 const title=screen==='paytable'?'TABLA DE PREMIOS':screen==='settings'?'CONFIGURACIÓN':screen==='history'?'HISTORIAL':info.title;
 return <SafeAreaView style={[styles.safe,{backgroundColor:slot==='cube'?'#100c22':slot==='royal'?'#1d1008':'#100a20'}]}>
 <StatusBar barStyle="light-content"/><ExpoStatusBar style="light"/>
 {!state.accepted?<View style={styles.disclaimer}><Text style={styles.logo}>SIX SEVEN <Text style={{color:'#ffcf69'}}>SLOTS</Text></Text><Text style={styles.disTitle}>ANTES DE JUGAR</Text><Text style={styles.disText}>{DISCLAIMER}</Text><Text style={styles.virtual}>{VIRTUAL}</Text><BTN label="SOY MAYOR DE 18 · CONTINUAR" onPress={()=>setState(p=>({...p,accepted:true}))} style={styles.goldButton}/><Text style={styles.small}>No hay apuestas ni premios con dinero real. Las fichas no se venden ni se canjean.</Text></View>
 :<><ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
 <View style={styles.header}><View><Text style={styles.logo}>SIX SEVEN <Text style={{color:info.colors[0]}}>SLOTS</Text></Text><Text style={styles.virtual}>{VIRTUAL}</Text></View><View style={styles.balancePill}><Text style={styles.small}>FICHAS</Text><Text style={styles.balance}>{money(state.balance)}</Text></View></View>
 <View style={styles.slotTabs}>{(['cube','royal','sweet'] as SlotId[]).map((s,i)=><Pressable key={s} onPress={()=>changeSlot(s)} style={[styles.slotTab,slot===s&&{borderColor:SLOT_INFO[s].colors[0],backgroundColor:SLOT_INFO[s].colors[0]+'25'}]}><Text style={styles.slotEmoji}>{['🧊','👑','🍬'][i]}</Text><Text style={styles.tabText}>{SLOT_INFO[s].title}</Text></Pressable>)}</View>
 {screen==='game'?<><View style={[styles.hero,{borderColor:info.colors[0]}]}><Text style={[styles.heroTitle,{color:info.colors[0]}]}>{info.title}</Text><Text style={styles.heroSub}>{info.subtitle}</Text><View style={styles.characters}>{(slot==='cube'?['😎','🤖','👾']:slot==='royal'?['🤴','👑','🧔']:['🍬','🐻','🍭']).map((x,i)=><View key={i} style={[styles.character,{borderColor:info.colors[i]}]}><Text style={styles.characterEmoji}>{x}</Text><Text style={[styles.characterLabel,{color:info.colors[i]}]}>{slot==='royal'?['COLLECT','BOOST','PAYER'][i]:slot==='cube'?['FREE GAMES','PIN WIN','PICK’EM'][i]:['FREE GAMES','PICK’EM','PIN WIN'][i]}</Text></View>)}</View></View>
 <View style={[styles.machine,{borderColor:slot==='royal'?'#ffd36a':'#d6ad63'}]}><View style={styles.machineTop}><Text style={styles.machineCaption}>✦ 20 LÍNEAS DE PAGO ✦</Text><Text style={styles.rtp}>RTP OBJETIVO {Math.round(state.rtp*100)}% · VOLATILIDAD MEDIA</Text></View>
 <View style={styles.reels}>{grid.map((row,r)=><View key={r} style={styles.reelRow}>{row.map((symbol,c)=><View key={c} style={[styles.cell,{borderColor:info.colors[(r+c)%3],backgroundColor:(r+c)%2?'#17132c':'#211b39'}]}><Text style={[styles.symbol,{fontSize:slot==='sweet'?23:27}]}>{symbol}</Text></View>)}</View>)}</View>
 {result&&<View style={styles.resultBar}><Text style={styles.resultText}>{result.win>0?'GANASTE '+money(result.win):'¡SUERTE EN EL PRÓXIMO GIRO!'}</Text>{result.winningLines.length>0&&<Text style={styles.small}>Líneas ganadoras: {result.winningLines.join(', ')}</Text>}</View>}
 {freeGames>0&&<Text style={styles.freeBadge}>✦ FREE GAMES: {freeGames} · MULTIPLICADOR x2 ✦</Text>}
 </View>
 <View style={styles.betRow}><View style={styles.stat}><Text style={styles.small}>APUESTA / GIRO</Text><Text style={styles.statValue}>{money(bet)}</Text><View style={styles.inline}><Pressable onPress={()=>setBet(b=>clampBet(b-50))} style={styles.roundBtn}><Text style={styles.buttonText}>−</Text></Pressable><Pressable onPress={()=>setBet(b=>clampBet(b+50))} style={styles.roundBtn}><Text style={styles.buttonText}>+</Text></Pressable></View></View><View style={styles.stat}><Text style={styles.small}>NIVEL</Text><Text style={styles.statValue}>{state.level}</Text><Text style={styles.small}>GIROS GRATIS {freeGames}</Text></View></View>
 <View style={styles.controls}><BTN label="★" sub="PREMIOS" onPress={()=>setScreen('paytable')} style={styles.iconButton}/><BTN label="⚙" sub="AJUSTES" onPress={()=>setScreen('settings')} style={styles.iconButton}/><Pressable disabled={spinning} onPress={()=>doSpin()} style={[styles.spinButton,{backgroundColor:info.colors[0],opacity:spinning?.65:1}]}><Text style={styles.spinIcon}>{spinning?'…':'↻'}</Text><Text style={styles.spinText}>{spinning?'GIRANDO':'GIRAR'}</Text></Pressable><BTN label="⟳" sub="AUTO" onPress={()=>setAutoLeft(autoLeft?0:10)} style={styles.iconButton}/><BTN label="☰" sub="MENÚ" onPress={()=>setScreen('history')} style={styles.iconButton}/></View>
 <View style={styles.secondary}><BTN label="RECARGAR $ 50.000" sub="ILIMITADO · FICHAS VIRTUALES" onPress={reload} style={styles.reloadButton}/><BTN label="BUY BONUS" sub="100× APUESTA · SOLO VIRTUAL" onPress={()=>{if(state.balance<bet*100){Alert.alert('Fichas insuficientes','Recargá fichas virtuales sin límite.');return}record('BUY BONUS',0,bet*100);setFreeGames(n=>n+10);Alert.alert('BONUS ACTIVADO','10 FREE GAMES con multiplicador x2.')}} style={styles.bonusButton}/></View>
 <View style={styles.autoRow}>{[10,25,50].map(n=><Pressable key={n} onPress={()=>startAuto(n)} style={[styles.autoChip,autoLeft===n&&styles.autoActive]}><Text style={styles.buttonText}>AUTO {n}</Text></Pressable>)}<Pressable onPress={()=>setTurbo(t=>!t)} style={[styles.autoChip,turbo&&styles.autoActive]}><Text style={styles.buttonText}>{turbo?'⚡ TURBO ON':'⚡ TURBO'}</Text></Pressable><Pressable onPress={()=>setAutoLeft(0)} style={styles.autoChip}><Text style={styles.buttonText}>STOP</Text></Pressable></View>
 </>:screen==='paytable'?<View style={styles.panel}><Text style={styles.panelTitle}>CÓMO SE GANA</Text><Text style={styles.bodyText}>• 20 líneas de izquierda a derecha, 3 o más símbolos iguales.</Text><Text style={styles.bodyText}>• 🃏 Wild sustituye símbolos normales.</Text><Text style={styles.bodyText}>• ⭐ Scatter: 3 o más otorgan 5+ giros gratis, con multiplicador x2.</Text><Text style={styles.bodyText}>• Los premios dependen del símbolo y la longitud de la combinación.</Text>{['🍒 🍋','🍉 🍇 🍊','⭐ 💎','👑 🃏','🍬 🐻 🍭'].map((x,i)=><View key={i} style={styles.payLine}><Text style={styles.symbol}>{x}</Text><Text style={styles.bodyText}>{['x2','x3','x5–x8','x12 / Wild x10','x3–x5'][i]}</Text></View>)}<Text style={styles.virtual}>{VIRTUAL}</Text><BTN label="VOLVER AL JUEGO" onPress={()=>setScreen('game')}/></View>
 :screen==='settings'?<View style={styles.panel}><Text style={styles.panelTitle}>AJUSTES DE SIMULACIÓN</Text><Text style={styles.bodyText}>RTP objetivo (solo parámetro de simulación; no garantiza premios):</Text>{[0.92,0.94,0.96,0.98].map(n=><Pressable key={n} onPress={()=>setState(p=>({...p,rtp:n}))} style={[styles.settingRow,state.rtp===n&&styles.autoActive]}><Text style={styles.bodyText}>{Math.round(n*100)}% {state.rtp===n?'✓':''}</Text></Pressable>)}<Text style={styles.bodyText}>Fichas iniciales: {money(100000)}. Las recargas son ilimitadas y no tienen valor real.</Text><BTN label="VOLVER AL JUEGO" onPress={()=>setScreen('game')}/></View>
 :<View style={styles.panel}><Text style={styles.panelTitle}>ÚLTIMOS MOVIMIENTOS</Text>{state.history.slice(0,35).map(h=><View key={h.id} style={styles.historyRow}><View style={{flex:1}}><Text style={styles.bodyText}>{h.kind} · {h.slot}</Text><Text style={styles.small}>{new Date(h.at).toLocaleString('es-AR')}</Text></View><Text style={[styles.bodyText,{color:h.win>0?'#68ffb4':'#ffd36a'}]}>{h.win?'+':''}{money(h.win)}</Text></View>)}{state.history.length===0&&<Text style={styles.bodyText}>Todavía no hay movimientos.</Text>}<BTN label="VOLVER AL JUEGO" onPress={()=>setScreen('game')}/></View>}
 <Text style={styles.footerLegal}>{VIRTUAL}</Text><Text style={styles.footerLegal}>{DISCLAIMER}</Text>
 </ScrollView></>}
 </SafeAreaView>
}
const styles=StyleSheet.create({
 safe:{flex:1},page:{paddingHorizontal:12,paddingBottom:26},header:{paddingTop:8,paddingBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},logo:{fontSize:22,fontWeight:'900',letterSpacing:1.8,color:'#fff'},virtual:{fontSize:8,fontWeight:'900',color:'#ffcf69',letterSpacing:.45,marginTop:4},balancePill:{backgroundColor:'#211a36',borderColor:'#ffcf69',borderWidth:1,borderRadius:12,paddingVertical:7,paddingHorizontal:11,alignItems:'flex-end'},balance:{color:'#fff',fontSize:17,fontWeight:'900'},small:{fontSize:9,color:'#bcb4d4',fontWeight:'700'},slotTabs:{flexDirection:'row',gap:7,marginBottom:10},slotTab:{flex:1,minHeight:57,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#43365e',borderRadius:10,backgroundColor:'#17122a',paddingHorizontal:3},slotEmoji:{fontSize:19},tabText:{fontSize:9,color:'#fff',fontWeight:'900',textAlign:'center'},hero:{borderWidth:1,borderRadius:13,backgroundColor:'#171027',padding:10,marginBottom:8},heroTitle:{fontSize:22,fontWeight:'900',textAlign:'center',letterSpacing:1.5},heroSub:{color:'#e3d6ff',fontSize:9,textAlign:'center',letterSpacing:3,marginBottom:8},characters:{flexDirection:'row',justifyContent:'space-around',gap:7},character:{flex:1,alignItems:'center',borderWidth:1,borderRadius:9,backgroundColor:'#100c20',paddingVertical:5},characterEmoji:{fontSize:29},characterLabel:{fontSize:8,fontWeight:'900',textAlign:'center'},machine:{borderWidth:3,borderRadius:15,backgroundColor:'#0b0815',padding:7,shadowColor:'#ffcf69',shadowOpacity:.22,shadowRadius:10},machineTop:{alignItems:'center',marginBottom:7},machineCaption:{color:'#ffdb82',fontWeight:'900',fontSize:13,letterSpacing:1.5},rtp:{fontSize:8,color:'#c9bfdc',marginTop:2},reels:{gap:4},reelRow:{flexDirection:'row',gap:4},cell:{flex:1,aspectRatio:1,borderRadius:6,borderWidth:1,alignItems:'center',justifyContent:'center',minHeight:40},symbol:{fontSize:27,textAlign:'center'},resultBar:{alignItems:'center',marginTop:8,padding:5,backgroundColor:'#231936',borderRadius:7},resultText:{fontSize:13,fontWeight:'900',color:'#ffdf87',textAlign:'center'},freeBadge:{color:'#69ffb9',fontWeight:'900',textAlign:'center',fontSize:12,marginTop:8},betRow:{flexDirection:'row',gap:8,marginTop:10},stat:{flex:1,backgroundColor:'#19142a',borderRadius:10,padding:9,borderWidth:1,borderColor:'#3b2e54'},statValue:{fontSize:19,fontWeight:'900',color:'#fff',marginVertical:3},inline:{flexDirection:'row',gap:8,marginTop:3},roundBtn:{width:28,height:25,borderRadius:7,alignItems:'center',justifyContent:'center',backgroundColor:'#3b2c58'},controls:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:5,marginTop:10},button:{backgroundColor:'#322448',borderColor:'#55436e',borderWidth:1,borderRadius:9,paddingVertical:10,paddingHorizontal:8,alignItems:'center',justifyContent:'center',minHeight:43},buttonText:{fontSize:11,color:'#fff',fontWeight:'900',textAlign:'center'},iconButton:{flex:1,paddingHorizontal:2,minHeight:47},spinButton:{width:86,height:86,borderRadius:43,alignItems:'center',justifyContent:'center',borderWidth:4,borderColor:'#ffe5a0',elevation:5},spinIcon:{fontSize:36,fontWeight:'900',color:'#170e21',lineHeight:39},spinText:{fontSize:11,fontWeight:'900',color:'#170e21'},secondary:{flexDirection:'row',gap:7,marginTop:10},reloadButton:{flex:1,backgroundColor:'#165d48',borderColor:'#54f0b2'},bonusButton:{flex:1,backgroundColor:'#67401c',borderColor:'#ffce67'},autoRow:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:8,justifyContent:'center'},autoChip:{borderRadius:8,borderWidth:1,borderColor:'#504063',backgroundColor:'#1b152b',paddingVertical:8,paddingHorizontal:10},autoActive:{borderColor:'#ffcf69',backgroundColor:'#42321f'},footerLegal:{fontSize:8,color:'#aaa0bf',textAlign:'center',marginTop:12},disclaimer:{flex:1,justifyContent:'center',alignItems:'center',padding:26,backgroundColor:'#100b20'},disTitle:{fontSize:21,fontWeight:'900',color:'#ffcf69',marginTop:24,marginBottom:10},disText:{fontSize:16,lineHeight:24,color:'#fff',textAlign:'center'},goldButton:{marginTop:20,backgroundColor:'#7b5520',borderColor:'#ffcf69',padding:15},panel:{backgroundColor:'#181229',borderColor:'#d6ad63',borderWidth:2,borderRadius:15,padding:15,minHeight:360},panelTitle:{fontSize:20,fontWeight:'900',color:'#ffcf69',textAlign:'center',marginBottom:14},bodyText:{fontSize:13,color:'#f5f0ff',lineHeight:21,marginVertical:5},payLine:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:8,borderBottomWidth:1,borderBottomColor:'#3e3153'},settingRow:{padding:11,borderRadius:8,borderWidth:1,borderColor:'#45365c',marginVertical:4},historyRow:{flexDirection:'row',alignItems:'center',paddingVertical:9,borderBottomWidth:1,borderBottomColor:'#3b2d50'},disclaimerText:{color:'#fff'}
});
