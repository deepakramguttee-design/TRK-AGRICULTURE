import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserCheck, Search, Building2, User } from 'lucide-react'
import { Input } from '@/components/ui/input'

const ACCOUNT_STYLES = {
  retail: { label: 'Particulier', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  b2b:    { label: 'Professionnel', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminUsersList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('customers')
      .select('id, full_name, phone, account_type, company_name, preferred_lang, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setCustomers(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = customers.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (c.full_name ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.company_name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? '…' : `${customers.length} compte${customers.length !== 1 ? 's' : ''} enregistré${customers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Nom, téléphone, entreprise…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {search ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur enregistré.'}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Utilisateur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Téléphone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Langue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const type = ACCOUNT_STYLES[c.account_type] ?? { label: c.account_type ?? '—', cls: 'bg-muted text-muted-foreground' }
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {c.account_type === 'b2b'
                            ? <Building2 className="h-4 w-4 text-primary" />
                            : <User className="h-4 w-4 text-primary" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{c.full_name || <span className="text-muted-foreground italic">Sans nom</span>}</p>
                          {c.company_name && <p className="text-xs text-muted-foreground">{c.company_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {c.phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${type.cls}`}>
                        {type.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground uppercase">
                      {c.preferred_lang || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && customers.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-right">
          {filtered.length} / {customers.length} utilisateur{customers.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
