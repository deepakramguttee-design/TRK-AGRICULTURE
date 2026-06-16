import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Leaf, Eye, EyeOff, User, Phone, Mail, Lock } from 'lucide-react'
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

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [sub, setSub] = useState('login')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [regForm, setRegForm] = useState({ full_name: '', phone: '', email: '', password: '', confirm: '' })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)

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
        setSub('login')
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

          <div className="flex border-b">
            <button type="button" onClick={() => { setSub('login'); setRegErrors({}) }}
              className={tabCls(sub === 'login')}>Se connecter</button>
            <button type="button" onClick={() => { setSub('register'); setRegErrors({}) }}
              className={tabCls(sub === 'register')}>Créer un compte</button>
          </div>

          <div className="p-6">
            {sub === 'login' ? (
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

        <p className="text-center text-xs text-zinc-400 mt-6">
          Équipe TRK ?{' '}
          <Link to="/admin/login" className="text-primary hover:underline">Espace équipe</Link>
        </p>
      </div>
    </div>
  )
}
