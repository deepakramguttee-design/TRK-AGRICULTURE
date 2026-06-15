import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import {
  UserCheck, Search, Building2, User, Users, ShieldCheck,
  BriefcaseBusiness, Plus, X, Loader2, ChevronDown,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

// ── helpers ──────────────────────────────────────────────────────────────────
const ACCOUNT_STYLES = {
  retail: { label: 'Particulier',    cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  b2b:    { label: 'Professionnel',  cls: 'bg-violet-50 text-violet-700 border-violet-200' },
}
const ROLE_STYLES = {
  admin:   { label: 'Admin',    cls: 'bg-red-50 text-red-700 border-red-200',       icon: ShieldCheck },
  employe: { label: 'Employé',  cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: BriefcaseBusiness },
  client:  { label: 'Client',   cls: 'bg-blue-50 text-blue-700 border-blue-200',    icon: User },
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'employe' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) {
      toast({ title: 'Mot de passe trop court', description: 'Au moins 8 caractères.', variant: 'destructive' })
      return
    }
    setSaving(true)

    // Use a server-side RPC function so the admin's browser session is never replaced
    const { error } = await supabase.rpc('create_team_member', {
      p_email:     form.email.trim(),
      p_password:  form.password,
      p_full_name: form.full_name.trim(),
      p_role:      form.role,
    })

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
      setSaving(false)
      return
    }

    toast({ title: 'Membre ajouté', description: `${form.email} — rôle : ${form.role}.` })
    setSaving(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Ajouter un membre de l'équipe</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nom complet</label>
            <Input className="mt-1" placeholder="Prénom Nom" value={form.full_name} onChange={e => setForm(p=>({...p,full_name:e.target.value}))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</label>
            <Input className="mt-1" type="email" placeholder="email@exemple.com" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Mot de passe temporaire</label>
            <Input className="mt-1" type="password" placeholder="Min. 8 caractères" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Rôle</label>
            <div className="relative mt-1">
              <select
                value={form.role}
                onChange={e => setForm(p=>({...p,role:e.target.value}))}
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="employe">Employé</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le compte
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminUsersList() {
  const { isAdmin } = useAuth()
  const [tab, setTab]           = useState('clients')
  const [customers, setCustomers] = useState([])
  const [team, setTeam]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  async function loadCustomers() {
    const { data } = await supabase
      .from('customers')
      .select('id, full_name, phone, account_type, company_name, preferred_lang, created_at')
      .order('created_at', { ascending: false })
    setCustomers(data ?? [])
  }

  async function loadTeam() {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, email, full_name, created_at')
      .in('role', ['admin', 'employe'])
      .order('created_at', { ascending: false })
    setTeam(data ?? [])
  }

  useEffect(() => {
    Promise.all([loadCustomers(), loadTeam()]).finally(() => setLoading(false))
  }, [])

  async function changeRole(id, newRole) {
    setUpdatingId(id)
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Rôle mis à jour' })
      await loadTeam()
    }
    setUpdatingId(null)
  }

  const filteredClients = customers.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (c.full_name??'').toLowerCase().includes(q) || (c.phone??'').includes(q) || (c.company_name??'').toLowerCase().includes(q)
  })

  const filteredTeam = team.filter(m => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (m.full_name??'').toLowerCase().includes(q) || (m.email??'').toLowerCase().includes(q)
  })

  const TABS = [
    { id: 'clients', label: 'Clients', icon: Users,     count: customers.length },
    { id: 'equipe',  label: 'Équipe',  icon: ShieldCheck, count: team.length },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        {isAdmin && tab === 'equipe' && (
          <Button size="sm" onClick={() => setShowInvite(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Ajouter un membre
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 rounded-lg p-1 w-fit mb-5 border">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSearch('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white shadow-sm text-zinc-900'
                : 'text-muted-foreground hover:text-zinc-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
              tab === id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={tab === 'clients' ? 'Nom, téléphone, entreprise…' : 'Nom, email…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : tab === 'clients' ? (
        /* ── CLIENTS ── */
        filteredClients.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {search ? 'Aucun résultat.' : 'Aucun client enregistré.'}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b">
                  {['Utilisateur','Téléphone','Type','Langue','Inscrit le'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(c => {
                  const type = ACCOUNT_STYLES[c.account_type] ?? { label: c.account_type??'—', cls: 'bg-muted text-muted-foreground' }
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {c.account_type === 'b2b' ? <Building2 className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                          </div>
                          <div>
                            <Link
                              to={`/admin/utilisateurs/clients/${c.id}`}
                              className="font-medium text-zinc-900 hover:text-primary hover:underline underline-offset-2 transition-colors"
                            >
                              {c.full_name || <span className="italic text-muted-foreground">Sans nom</span>}
                            </Link>
                            {c.company_name && <p className="text-xs text-muted-foreground">{c.company_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.phone||'—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${type.cls}`}>{type.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground uppercase">{c.preferred_lang||'—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(c.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* ── ÉQUIPE ── */
        filteredTeam.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {search ? 'Aucun résultat.' : 'Aucun membre d\'équipe.'}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b">
                  {['Membre','Email','Rôle','Membre depuis',isAdmin ? 'Action' : ''].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTeam.map(m => {
                  const rs = ROLE_STYLES[m.role] ?? { label: m.role, cls: 'bg-muted text-muted-foreground', icon: User }
                  const RoleIcon = rs.icon
                  return (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role==='admin'?'bg-red-50':'bg-amber-50'}`}>
                            <RoleIcon className={`h-4 w-4 ${m.role==='admin'?'text-red-500':'text-amber-500'}`} />
                          </div>
                          <p className="font-medium text-zinc-900">{m.full_name || <span className="italic text-muted-foreground">—</span>}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{m.email||'—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${rs.cls}`}>
                          <RoleIcon className="h-3 w-3" />{rs.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(m.created_at)}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="relative">
                            <select
                              value={m.role}
                              disabled={updatingId === m.id}
                              onChange={e => changeRole(m.id, e.target.value)}
                              className="text-xs border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-ring pr-6 appearance-none disabled:opacity-50"
                            >
                              <option value="employe">Employé</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onCreated={() => loadTeam()}
        />
      )}
    </div>
  )
}
