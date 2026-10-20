import { useState } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase'

export default function PhoneLogin() {
  const [phone, setPhone] = useState('+54')
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState<any>(null)
  const [step, setStep] = useState<'phone'|'code'>('phone')

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'phone-login-recaptcha', {
        size: 'invisible',
      })
    }
  }

  const sendCode = async () => {
    try {
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      const conf = await signInWithPhoneNumber(auth, phone, appVerifier)
      setConfirmation(conf)
      setStep('code')
      alert('Código enviado a ' + phone)
    } catch (e:any) {
      alert('Error enviando SMS: ' + e.message)
      console.error(e)
    }
  }

  const verifyCode = async () => {
    try {
      await confirmation.confirm(code)
    } catch (e:any) {
      alert('Código incorrecto: ' + e.message)
    }
  }

  return (
    <div style={{marginTop: 20, padding: 16, border: '1px solid #eee', borderRadius: 12}}>
      <div id="phone-login-recaptcha"></div>
      <h3 style={{marginBottom: 10}}>Entrar con número</h3>
      {step === 'phone' ? (
        <>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+5493751XXXXXXX" style={{width:'100%', padding: 12, borderRadius: 8, border: '1px solid #ccc'}} />
          <button onClick={sendCode} style={{width:'100%', marginTop:10, padding:12, background:'black', color:'white', borderRadius:8, fontWeight:'bold'}}>Enviar código por SMS</button>
          <p style={{fontSize:11, marginTop:8, color:'#666'}}>Formato: +54 9 + número. Ej: +5493751123456</p>
        </>
      ) : (
        <>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Código de 6 dígitos" style={{width:'100%', padding: 12, borderRadius: 8, border: '1px solid #ccc'}} />
          <button onClick={verifyCode} style={{width:'100%', marginTop:10, padding:12, background:'black', color:'white', borderRadius:8, fontWeight:'bold'}}>Verificar y entrar</button>
          <button onClick={()=>setStep('phone')} style={{marginTop:8, background:'none', border:'none', color:'#666', width:'100%'}}>Cambiar número</button>
        </>
      )}
    </div>
  )
}
