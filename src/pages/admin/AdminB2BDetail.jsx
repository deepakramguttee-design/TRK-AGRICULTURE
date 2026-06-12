import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2, Mail, Phone, UserCheck } from 'lucide-react'

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

const VARIETY_COLORS = [
  'bg-green-100 text-green-700 border-green-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-lime-100 text-lime-700 border-lime-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
]

function formatDate(d) {
  const dt = new Date(d)
  return (
    dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function AdminB2BDetail() {
  const { id } = useParams()
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('b2b_inquiries')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
        else setInquiry(data)
        setLoading(false)
      })
  }, [id])

  async function handleStatusChange(newStatus) {
    setSaving(true)
    const { error } = await supabase
      .from('b2b_inquiries')
      .update({ status: newStatus })
      .eq('id', id)
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    } else {
      setInquiry(i => ({ ...i, status: newStatus }))
      toast({ title: 'Statut mis à jour ✓' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!inquiry) {
    return <p className="py-8 text-muted-foreground">Demande introuvable.</p>
  }

  const varieties = inquiry.varieties_interested ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild className="shrink-0 mt-0.5">
          <Link to="/admin/b2b">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{inquiry.business_name}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(inquiry.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={inquiry.status === 'contacted' || saving}
            onClick={() => handleStatusChange('contacted')}
          >
            <UserCheck className="h-4 w-4" />
            Marquer contacté
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={`mailto:${inquiry.email}`}>
              <Mail className="h-4 w-4" />
              Envoyer email
            </a>
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <a href={`tel:${inquiry.phone}`}>
              <Phone className="h-4 w-4" />
              Appeler
            </a>
          </Button>
          <Select value={inquiry.status} onValueChange={handleStatusChange} disabled={saving}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gauche — Entreprise + Contact */}
        <div className="space-y-4">
          <div className="rounded-lg border p-5 space-y-2.5">
            <h2 className="font-semibold border-b pb-2 mb-3">Entreprise</h2>
            <InfoRow label="Nom" value={inquiry.business_name} />
            <InfoRow label="Type" value={BUSINESS_TYPE_LABELS[inquiry.business_type] ?? inquiry.business_type} />
            <InfoRow label="Volume estimé" value={inquiry.estimated_volume} />
          </div>
          <div className="rounded-lg border p-5 space-y-2.5">
            <h2 className="font-semibold border-b pb-2 mb-3">Contact</h2>
            <InfoRow label="Nom" value={inquiry.contact_name} />
            <InfoRow label="Email" value={inquiry.email} />
            <InfoRow label="Téléphone" value={inquiry.phone} />
          </div>
        </div>

        {/* Droite — Variétés + Message */}
        <div className="space-y-4">
          {varieties.length > 0 && (
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold border-b pb-2 mb-3">Variétés intéressées</h2>
              <div className="flex flex-wrap gap-2">
                {varieties.map((v, i) => (
                  <span
                    key={v}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      VARIETY_COLORS[i % VARIETY_COLORS.length]
                    }`}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold border-b pb-2 mb-3">Message</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {inquiry.message || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Statut actuel :</span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            STATUS_COLORS[inquiry.status] ?? 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {STATUS_LABELS[inquiry.status] ?? inquiry.status}
        </span>
      </div>
    </div>
  )
}
