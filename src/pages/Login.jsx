import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Leaf, Eye, EyeOff, User, Phone, Mail, Lock, MessageSquare } from 'lucide-react'
import { isValidMauritiusPhone } from '@/lib/delivery'

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />}
        <div className={Icon ? '[&>input]:pl-9' : ''}>{children}</div>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input type={show ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} className="pl-9 pr-9" required />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function toE164(p) {
  const d = p.replace(/\D/g, '')
  return d.startsWith('230') ? '+' + d : '+230' + d
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('phone')

  // ── OTP state ──
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profileAddress, setProfileAddress] = useState('')
  const [otpPhase, setOtpPhase] = useState('enter_phone') // enter_phone | enter_otp | complete_profile
  const [otpLoading, setOtpLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // ── Email state ──
  const [emailSub, setEmailSub] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [regForm, setRegForm] = useState({ full_name: '', phone: '', email: '', password: '', confirm: '' })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // ── OTP handlers ─────────────────────────────────────────────
  async function handleSendOtp(e) {
    e?.preventDefault()
    if (!isValidMauritiusPhone(phone)) { setPhoneError('Numéro mauricien invalide (8 chiffres)'); return }
    setPhoneError('')
    setOtpLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) })
    setOtpLoading(false)
    if (error) { toast({ title: 'Erreur envoi SMS', description: error.message, variant: 'destructive' }); return }
    setOtpPhase('enter_otp')
    setCooldown(60)
    toast({ title: 'Code envoyé !', description: `SMS envoyé au +230 ${phone}` })
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (otpCode.trim().length < 6) { setOtpError('Code à 6 chiffres requis'); return }
    setOtpError('')
    setOtpLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: toE164(phone),
      token: otpCode.trim(),
      type: 'sms',
    })
    if (error) {
      setOtpLoading(false)
      setOtpError('Code incorrect ou expiré. Réessayez.')
      return
    }
    const uid = data.user?.id
    // Check admin/employee first
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).single()
    if (prof?.role === 'admin' || prof?.role === 'operator' || prof?.role === 'employe') {
      navigate('/admin', { replace: true })
      return
    }
    // Check if customer profile already exists
    const { data: existing } = await supabase.from('customers').select('id, full_name').eq('id', uid).single()
    setOtpLoading(false)
    if (!existing || !existing.full_name) {
      setOtpPhase('complete_profile')
      return
    }
    navigate('/compte', { replace: true })
  }

  async function handleCompleteProfile(e) {
    e.preventDefault()
    if (!profileName.trim()) return
    setOtpLoading(true)
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      await supabase.from('customers').upsert({
        id: u.id,
        full_name: profileName.trim(),
        phone: phone.replace(/\D/g, ''),
        address: profileAddress.trim() || null,
        account_type: 'retail',
        preferred_lang: 'fr',
      })
    }
    setOtpLoading(false)
    navigate('/compte', { replace: true })
  }

  // ── Email handlers ────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    setLoginLoading(true)
    const { data, error } = await signIn(loginForm.email, loginForm.password)
    if (error) {
      toast({ title: 'Connexion impossible', description: error.message, variant: 'destructive' })
      setLoginLoading(false)
      return
    }
    const uid = data?.user?.id
    if (uid) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).single()
      if (prof?.role === 'admin' || prof?.role === 'operator' || prof?.role === 'employe') {
        navigate('/admin', { replace: true })
        return
      }
    }
    navigate('/compte', { replace: true })
  }

  function validateReg() {
    const e = {}
    if (!regForm.full_name.trim()) e.full_name = 'Nom requis'
    if (!regForm.phone.trim() || !isValidMauritiusPhone(regForm.phone)) e.phone = 'Numéro mauricien invalide'
    if (!regForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) e.email = 'Email invalide'
    if (regForm.password.length < 6) e.password = 'Au moins 6 caractères'
    if (regForm.password !== regForm.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    return e
  }

  async function handleRegister(e) {
    e.preventDefault()
    const errs = validateReg()
    if (Object.keys(errs).length) { setRegErrors(errs); return }
    setRegLoading(true)
    const email = regForm.email.trim()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: regForm.password,
      options: { data: { full_name: regForm.full_name.trim() } },
    })
    if (error) {
      toast({ title: 'Erreur création compte', description: error.message, variant: 'destructive' })
      setRegLoading(false)
      return
    }
    const uid = data.user?.id
    if (uid) {
      await supabase.from('customers').upsert({
        id: uid,
        full_name: regForm.full_name.trim(),
        phone: regForm.phone.trim().replace(/[\s\-().]/g, ''),
        account_type: 'retail',
        preferred_lang: 'fr',
      })
    }
    if (!data.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: regForm.password })
      if (signInErr) {
        toast({ title: 'Compte créé — vérifiez votre email', description: 'Connectez-vous après confirmation.' })
        setEmailSub('login')
        setRegLoading(false)
        return
      }
    }
    toast({ title: 'Compte créé !', description: 'Bienvenue chez TRK Agriculture.' })
    navigate('/compte', { replace: true })
  }

  const tabCls = (active) =>
    `flex-1 py-3.5 text-sm font-semibold transition-colors ${active
      ? 'text-primary border-b-2 border-primary bg-white'
      : 'text-zinc-400 hover:text-zinc-600 bg-muted/30'}`

  return (
    <div className="min-h-[calc(100vh-6.25rem)] bg-[#f4f1ea] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">TRK Agriculture</h1>
          <p className="text-sm text-zinc-500 mt-1">Votre espace personnel</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

          {/* Tabs principaux */}
          <div className="flex border-b">
            <button type="button" onClick={() => { setTab('phone'); setOtpPhase('enter_phone') }}
              className={tabCls(tab === 'phone')}>
              <span className="flex items-center justify-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Téléphone
              </span>
            </button>
            <button type="button" onClick={() => setTab('email')}
              className={tabCls(tab === 'email')}>
              <span className="flex items-center justify-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </span>
            </button>
          </div>

          {/* ── Tab Téléphone (OTP) ── */}
          {tab === 'phone' && (
            <div className="p-6">
              {otpPhase === 'enter_phone' && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <p className="text-sm text-zinc-600">
                    Entrez votre numéro pour recevoir un code par SMS — aucun mot de passe requis.
                  </p>
                  <Field label="Numéro de téléphone" icon={Phone} error={phoneError}>
                    <Input type="tel" placeholder="52 345 678" value={phone}
                      onChange={e => { setPhone(e.target.value); setPhoneError('') }}
                      autoComplete="tel" className={`pl-9 ${phoneError ? 'border-destructive' : ''}`} />
                  </Field>
                  <p className="text-xs text-zinc-400">Numéro mauricien : Emtel, my.t, Chili (8 chiffres)</p>
                  <Button type="submit" className="w-full" disabled={otpLoading}>
                    {otpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                    Recevoir le code SMS
                  </Button>
                </form>
              )}

              {otpPhase === 'enter_otp' && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Code envoyé au <strong>+230 {phone}</strong>
                  </div>
                  <Field label="Code SMS (6 chiffres)" icon={Lock} error={otpError}>
                    <Input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                      placeholder="000000" value={otpCode}
                      onChange={e => { setOtpCode(e.target.value); setOtpError('') }}
                      className={`pl-9 tracking-widest text-center font-mono text-lg ${otpError ? 'border-destructive' : ''}`}
                      autoFocus />
                  </Field>
                  <Button type="submit" className="w-full" disabled={otpLoading}>
                    {otpLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Vérifier mon code
                  </Button>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <button type="button" className="hover:underline text-zinc-400"
                      onClick={() => { setOtpPhase('enter_phone'); setOtpCode(''); setOtpError('') }}>
                      Changer de numéro
                    </button>
                    {cooldown > 0 ? (
                      <span>Renvoyer dans {cooldown}s</span>
                    ) : (
                      <button type="button" className="text-primary hover:underline" onClick={handleSendOtp}>
                        Renvoyer le code
                      </button>
                    )}
                  </div>
                </form>
              )}

              {otpPhase === 'complete_profile' && (
                <form onSubmit={handleCompleteProfile} className="flex flex-col gap-4">
                  <div className="text-center mb-2">
                    <p className="font-semibold text-zinc-900">Bienvenue !</p>
                    <p className="text-sm text-zinc-500 mt-1">Complétez votre profil pour finaliser votre compte.</p>
                  </div>
                  <Field label="Prénom et nom *" icon={User}>
                    <Input placeholder="Jean Dupont" value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="pl-9" required autoFocus />
                  </Field>
                  <Field label="Adresse de livraison (optionnel)">
                    <Input placeholder="Rue, village, district" value={profileAddress}
                      onChange={e => setProfileAddress(e.target.value)} />
                  </Field>
                  <Button type="submit" className="w-full" disabled={otpLoading || !profileName.trim()}>
                    {otpLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Créer mon compte
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ── Tab Email ── */}
          {tab === 'email' && (
            <div>
              <div className="flex border-b">
                <button type="button" onClick={() => { setEmailSub('login'); setRegErrors({}) }}
                  className={tabCls(emailSub === 'login')}>Se connecter</button>
                <button type="button" onClick={() => { setEmailSub('register'); setRegErrors({}) }}
                  className={tabCls(emailSub === 'register')}>Créer un compte</button>
              </div>
              <div className="p-6">
                {emailSub === 'login' ? (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Field label="Email" icon={Mail}>
                      <Input type="email" placeholder="votre@email.com" value={loginForm.email}
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                        autoComplete="email" className="pl-9" required />
                    </Field>
                    <Field label="Mot de passe">
                      <PasswordInput value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••" autoComplete="current-password" />
                    </Field>
                    <Button type="submit" className="w-full mt-1" disabled={loginLoading}>
                      {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Se connecter
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <Field label="Nom complet *" icon={User} error={regErrors.full_name}>
                      <Input placeholder="Prénom Nom" value={regForm.full_name}
                        onChange={e => { setRegForm(f => ({ ...f, full_name: e.target.value })); setRegErrors(er => ({ ...er, full_name: undefined })) }}
                        autoComplete="name" className={`pl-9 ${regErrors.full_name ? 'border-destructive' : ''}`} />
                    </Field>
                    <Field label="Téléphone *" icon={Phone} error={regErrors.phone}>
                      <Input type="tel" placeholder="52 345 678" value={regForm.phone}
                        onChange={e => { setRegForm(f => ({ ...f, phone: e.target.value })); setRegErrors(er => ({ ...er, phone: undefined })) }}
                        autoComplete="tel" className={`pl-9 ${regErrors.phone ? 'border-destructive' : ''}`} />
                    </Field>
                    <Field label="Email *" icon={Mail} error={regErrors.email}>
                      <Input type="email" placeholder="votre@email.com" value={regForm.email}
                        onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); setRegErrors(er => ({ ...er, email: undefined })) }}
                        autoComplete="email" className={`pl-9 ${regErrors.email ? 'border-destructive' : ''}`} />
                    </Field>
                    <Field label="Mot de passe *" error={regErrors.password}>
                      <PasswordInput value={regForm.password}
                        onChange={e => { setRegForm(f => ({ ...f, password: e.target.value })); setRegErrors(er => ({ ...er, password: undefined })) }}
                        placeholder="Min. 6 caractères" autoComplete="new-password" />
                    </Field>
                    <Field label="Confirmer *" error={regErrors.confirm}>
                      <PasswordInput value={regForm.confirm}
                        onChange={e => { setRegForm(f => ({ ...f, confirm: e.target.value })); setRegErrors(er => ({ ...er, confirm: undefined })) }}
                        placeholder="••••••••" autoComplete="new-password" />
                    </Field>
                    <Button type="submit" className="w-full mt-1" disabled={regLoading}>
                      {regLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer mon compte
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Équipe TRK ?{' '}
          <Link to="/admin/login" className="text-primary hover:underline">Espace équipe</Link>
        </p>
      </div>
    </div>
  )
}
