import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Leaf, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await signIn(email, password)
    if (error) {
      toast({ title: 'Connexion impossible', description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }
    const role = data?.user?.id
      ? await fetch(`/api/role`).catch(() => null)
      : null
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-green-200">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">TRK Agriculture</h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Espace équipe
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <h2 className="text-base font-semibold text-zinc-800 mb-5">Connexion</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="prenom@trk-agriculture.mu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide" htmlFor="password">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10 mt-1 font-semibold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Client ?{' '}
          <Link to="/compte" className="text-primary hover:underline">
            Accéder à votre compte
          </Link>
        </p>
      </div>
    </div>
  )
}
