import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2, CheckCircle2, Smartphone, Banknote } from 'lucide-react'
import { getProvider } from '@/lib/payments'

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  en_route:  'En route',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

function parseNotes(notes) {
  const lines = (notes || '').split('\n')
  const get = prefix => {
    const line = lines.find(l => l.startsWith(prefix + ':'))
    return line ? line.slice(prefix.length + 1).trim() : ''
  }
  return {
    name:     get('Nom'),
    phone:    get('Tél'),
    district: get('District'),
    address:  get('Adresse'),
    slot:     get('Créneau'),
    notes:    get('Notes'),
  }
}

function formatDate(d) {
  const dt = new Date(d)
  return (
    dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatPrice(n) {
  const parts = Number(n).toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return 'Rs ' + parts[0] + '.' + parts[1]
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

export default function AdminOrderDetail() {
  const { order_number } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: o, error: oe } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', order_number)
        .single()
      if (oe) {
        toast({ title: 'Erreur', description: oe.message, variant: 'destructive' })
        setLoading(false)
        return
      }
      setOrder(o)
      const { data: its } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', o.id)
      setItems(its ?? [])
      setLoading(false)
    }
    load()
  }, [order_number])

  async function handleStatusChange(newStatus) {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    } else {
      setOrder(o => ({ ...o, status: newStatus }))
      toast({ title: 'Statut mis à jour ✓' })
    }
    setSaving(false)
  }

  async function handleValidateJuice() {
    setSaving(true)
    const provider = getProvider('juice')
    const { error } = await supabase
      .from('orders')
      .update(provider.markPaidPayload())
      .eq('id', order.id)
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    } else {
      setOrder(o => ({ ...o, payment_status: 'paid', paid_at: new Date().toISOString() }))
      toast({ title: 'Paiement Juice validé ✓', description: 'La commande est marquée comme payée.' })
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

  if (!order) {
    return <p className="py-8 text-muted-foreground">Commande introuvable.</p>
  }

  const parsed = parseNotes(order.customer_notes)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/commandes">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex-1">Commande {order.order_number}</h1>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Select value={order.status} onValueChange={handleStatusChange} disabled={saving}>
            <SelectTrigger className="w-44">
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

      {/* 2 colonnes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gauche — Infos client */}
        <div className="rounded-lg border p-5 space-y-2.5">
          <h2 className="font-semibold border-b pb-2 mb-3">Informations client</h2>
          <InfoRow label="Nom" value={parsed.name} />
          <InfoRow label="Téléphone" value={order.guest_phone} />
          <InfoRow label="Email" value={order.guest_email} />
          <InfoRow label="District" value={parsed.district} />
          <InfoRow label="Adresse" value={parsed.address} />
          <InfoRow label="Créneau" value={parsed.slot} />
          <InfoRow label="Notes" value={parsed.notes} />
          <InfoRow label="Date" value={formatDate(order.created_at)} />
        </div>

        {/* Droite — Articles */}
        <div className="rounded-lg border p-5">
          <h2 className="font-semibold border-b pb-2 mb-3">Articles commandés</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-muted-foreground">Produit</th>
                  <th className="pb-2 font-medium text-muted-foreground text-center">Qté</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">P.U.</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{formatPrice(item.unit_price_mur)}</td>
                    <td className="py-2 text-right font-medium">{formatPrice(item.line_total_mur)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted-foreground text-center text-xs">
                      Aucun article
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paiement */}
      <div className="mt-6 rounded-lg border p-5">
        <h2 className="font-semibold border-b pb-2 mb-3 flex items-center gap-2">
          {order.payment_method === 'juice'
            ? <><Smartphone className="h-4 w-4 text-green-600" /> Paiement Juice</>
            : <><Banknote className="h-4 w-4 text-muted-foreground" /> Paiement à la livraison (COD)</>
          }
        </h2>
        <div className="flex flex-wrap gap-6 items-start">
          <div className="space-y-2 text-sm flex-1 min-w-48">
            <InfoRow label="Méthode" value={order.payment_method === 'juice' ? 'MCB Juice' : 'Cash on Delivery'} />
            <InfoRow label="Statut paiement"
              value={order.payment_status === 'paid' ? '✅ Payé' : order.payment_status === 'pending' ? '⏳ En attente' : order.payment_status} />
            {order.provider_txn_id && (
              <InfoRow label="ID transaction" value={order.provider_txn_id} />
            )}
            {order.paid_at && (
              <InfoRow label="Payé le" value={formatDate(order.paid_at)} />
            )}
          </div>
          {order.payment_method === 'juice' && order.payment_status === 'pending' && (
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
                <p className="text-sm text-amber-800 font-medium">Paiement en attente de validation</p>
                {order.provider_txn_id ? (
                  <p className="text-xs text-amber-700">
                    ID transaction client : <code className="font-mono font-semibold">{order.provider_txn_id}</code>
                  </p>
                ) : (
                  <p className="text-xs text-amber-600">Le client n'a pas encore renseigné son ID de transaction.</p>
                )}
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={handleValidateJuice}
                  disabled={saving}
                >
                  {saving
                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Enregistrement…</>
                    : <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Valider le paiement Juice</>
                  }
                </Button>
              </div>
            </div>
          )}
          {order.payment_method === 'juice' && order.payment_status === 'paid' && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Paiement Juice validé
            </div>
          )}
        </div>
      </div>

      {/* Récap financier */}
      <div className="mt-6 rounded-lg border p-5 max-w-xs ml-auto space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span>{formatPrice(order.subtotal_mur)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span>
            {Number(order.delivery_fee_mur) === 0
              ? 'Offerte'
              : formatPrice(order.delivery_fee_mur)}
          </span>
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2">
          <span>TOTAL</span>
          <span className="text-green-600 text-lg">{formatPrice(order.total_mur)}</span>
        </div>
      </div>
    </div>
  )
}
