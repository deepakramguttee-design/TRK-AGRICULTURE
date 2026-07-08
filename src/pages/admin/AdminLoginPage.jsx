import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Leaf, ShieldCheck, Eye, EyeOff, ShieldAlert } from 'lucide-react'

// Phase: 'credentials' → 'totp' → done
export default function AdminLoginPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('credentials') // 'credentials' | 'totp' | 'enroll'
  const [totpCode, setTotpCode] = useState('')
  const [factorId, setFactorId] = useState(null)
  const [challengeId, setChallengeId] = useState(null)
  const [enrollData, setEnrollData] = useState(null) // { id, totp: { qr_code, secret } }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({ title: t('adminLogin.connectionError'), description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }

    // Check if this user is admin/operator before requiring TOTP
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isStaff = prof?.role === 'admin' || prof?.role === 'operator'

    if (!isStaff) {
      // Not staff — redirect customer to their account
      navigate('/compte', { replace: true })
      return
    }

    // Check MFA status
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const enrolled = aalData?.nextLevel === 'aal2' || aalData?.currentLevel === 'aal2'

    if (!enrolled) {
      // No TOTP enrolled yet — force enrollment
      const { data: enroll, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'TRK Agriculture', friendlyName: 'Authenticator' })
      if (enrollErr) {
        toast({ title: t('adminLogin.totpError'), description: enrollErr.message, variant: 'destructive' })
        setLoading(false)
        return
      }
      setEnrollData(enroll)
      setFactorId(enroll.id)
      // Start challenge immediately
      const { data: ch } = await supabase.auth.mfa.challenge({ factorId: enroll.id })
      setChallengeId(ch?.id ?? null)
      setPhase('enroll')
      setLoading(false)
      return
    }

    // TOTP enrolled — get factors and challenge
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totp = factors?.totp?.[0]
    if (!totp) {
      toast({ title: 'Authentication Error', description: 'No TOTP factor found. Please contact your administrator.', variant: 'destructive' })
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    setFactorId(totp.id)
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id })
    if (chErr) {
      toast({ title: t('adminLogin.totpError'), description: chErr.message, variant: 'destructive' })
      setLoading(false)
      return
    }
    setChallengeId(ch.id)
    setPhase('totp')
    setLoading(false)
  }

  async function handleTOTP(e) {
    e.preventDefault()
    if (!totpCode.trim() || totpCode.length < 6) return
    setLoading(true)
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: totpCode.trim() })
    if (error) {
      toast({ title: t('adminLogin.invalidCode'), description: t('adminLogin.invalidCodeDesc'), variant: 'destructive' })
      setTotpCode('')
      setLoading(false)
      return
    }
    navigate('/admin', { replace: true })
  }

  if (phase === 'enroll') {
    return (
      <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 space-y-5">
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{t('adminLogin.enrollRequired')}</p>
          </div>
          <p className="text-xs text-zinc-500">{t('adminLogin.enrollDesc')}</p>
          {enrollData?.totp?.qr_code && (
            <img src={enrollData.totp.qr_code} alt="QR TOTP" className="w-48 h-48 mx-auto border rounded-lg" />
          )}
          {enrollData?.totp?.secret && (
            <p className="text-xs text-center text-zinc-500 font-mono break-all">{t('adminLogin.manualKey')} {enrollData.totp.secret}</p>
          )}
          <form onSubmit={handleTOTP} className="space-y-3">
            <Input placeholder={t('adminLogin.sixDigit')} value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6} inputMode="numeric" autoComplete="one-time-code" className="text-center text-lg tracking-widest" />
            <Button type="submit" className="w-full" disabled={loading || totpCode.length < 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('adminLogin.activate2fa')}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (phase === 'totp') {
    return (
      <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 space-y-5">
          <div className="flex flex-col items-center mb-2">
            <ShieldCheck className="h-10 w-10 text-primary mb-2" />
            <h2 className="font-semibold text-zinc-800">{t('adminLogin.verify2fa')}</h2>
            <p className="text-xs text-zinc-500 mt-1 text-center">{t('adminLogin.verifyDesc')}</p>
          </div>
          <form onSubmit={handleTOTP} className="space-y-3">
            <Input placeholder="000000" value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6} inputMode="numeric" autoComplete="one-time-code" autoFocus
              className="text-center text-2xl tracking-widest font-mono" />
            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading || totpCode.length < 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('adminLogin.confirmCode')}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">TRK Agriculture</h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            {t('adminLogin.title')}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <h2 className="text-base font-semibold text-zinc-800 mb-5">{t('adminLogin.signin')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Email</label>
              <Input type="email" placeholder="prenom@trk-agriculture.mu" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">{t('adminLogin.password')}</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password" className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 mt-1 font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('adminLogin.continue')}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-zinc-400 mt-6">
          {t('adminLogin.customerLink')} <Link to="/compte" className="text-primary hover:underline">{t('adminLogin.customerAccount')}</Link>
        </p>
      </div>
    </div>
  )
}
