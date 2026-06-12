import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const STATUS_LABELS = {
  new:        'Nouveau',
  contacted:  'Contacté',
  quote_sent: 'Devis envoyé',
  won:        'Gagné',
  lost:       'Perdu',
}

const STATUS_COLORS = {
  new:        'bg-orange-100 text-orange-700 border-orange-200',
  contacted:  'bg-blue-100 text-blue-700 border-blue-200',
  quote_sent: 'bg-violet-100 text-violet-700 border-violet-200',
  won:        'bg-green-100 text-green-700 border-green-200',
  lost:       'bg-gray-100 text-gray-600 border-gray-200',
}

const BUSINESS_TYPE_LABELS = {
  hotel:       'Hôtel',
  restaurant:  'Restaurant',
  landscaper:  'Paysagiste',
  green_space: 'Espace vert',
  other:       'Autre',
}

const BUSINESS_TYPES = Object.keys(BUSINESS_TYPE_LABELS)

function formatDate(d) {
  const dt = new Date(d)
  return (
    dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function AdminB2BList() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    supabase
      .from('b2b_inquiries')
      .select('id, created_at, business_name, business_type, contact_name, phone, estimated_volume, status')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast({ title: 'Erreur chargement', description: error.message, variant: 'destructive' })
        else setInquiries(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = inquiries.filter(i => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      (i.business_name || '').toLowerCase().includes(q) ||
      (i.contact_name || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || i.status === filterStatus
    const matchType = filterType === 'all' || i.business_type === filterType
    return matchSearch && matchStatus && matchType
  })

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Devis B2B</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{inquiries.length} demandes au total</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Entreprise ou contact…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-56"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {BUSINESS_TYPES.map(t => (
              <SelectItem key={t} value={t}>{BUSINESS_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Entreprise</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Téléphone</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Volume estimé</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inq => (
              <tr key={inq.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(inq.created_at)}
                </td>
                <td className="px-4 py-3 font-medium">{inq.business_name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {BUSINESS_TYPE_LABELS[inq.business_type] ?? inq.business_type}
                  </span>
                </td>
                <td className="px-4 py-3">{inq.contact_name}</td>
                <td className="px-4 py-3">{inq.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{inq.estimated_volume || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STATUS_COLORS[inq.status] ?? 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {STATUS_LABELS[inq.status] ?? inq.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/b2b/${inq.id}`}>Voir détails</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucune demande B2B trouvée</p>
        )}
      </div>
    </div>
  )
}
