import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react'

const TODAY = new Date().toISOString().slice(0, 10)
const EMPTY = {
  product_id: '', variety_name: '', sown_date: TODAY,
  estimated_days: 21, quantity_plateaux: 1, notes: '',
}

function daysElapsed(sownDate) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.floor((today - new Date(sownDate)) / 86400000)
}

function fmt(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminSowingList() {
  const [batches, setBatches] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadAll() {
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from('sowing_batches').select('*').order('sown_date', { ascending: false }),
      supabase.from('products').select('id, name_fr').eq('is_active', true).order('name_fr'),
    ])
    setBatches(b ?? [])
    setProducts(p ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  function onProductSelect(e) {
    const id = e.target.value
    const p = products.find(x => x.id === id)
    setForm(f => ({ ...f, product_id: id, variety_name: p ? p.name_fr : f.variety_name }))
  }

  function payload(f) {
    return {
      product_id: f.product_id || null,
      variety_name: f.variety_name,
      sown_date: f.sown_date,
      estimated_days: parseInt(f.estimated_days),
      quantity_plateaux: parseInt(f.quantity_plateaux) || 1,
      notes: f.notes || null,
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.variety_name || !form.sown_date) return
    setSaving(true)
    const { error } = await supabase.from('sowing_batches').insert(payload(form))
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    else { toast({ title: 'Lot ajouté ✓' }); setForm(EMPTY); loadAll() }
    setSaving(false)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('sowing_batches').update(payload(editTarget)).eq('id', editTarget.id)
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    else { toast({ title: 'Lot mis à jour ✓' }); setEditTarget(null); loadAll() }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('sowing_batches').delete().eq('id', deleteTarget.id)
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    else { toast({ title: 'Lot supprimé' }); setBatches(prev => prev.filter(b => b.id !== deleteTarget.id)) }
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Semis</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{batches.length} lot(s) enregistré(s)</p>
      </div>

      {/* Formulaire d'ajout */}
      <div className="rounded-lg border bg-muted/20 p-4 mb-6">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Ajouter un lot
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Produit (optionnel)</label>
            <select
              value={form.product_id}
              onChange={onProductSelect}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— Sélectionner —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name_fr}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nom de la variété *</label>
            <Input value={form.variety_name} onChange={e => setForm(f => ({ ...f, variety_name: e.target.value }))} placeholder="ex : Basilic Grand Vert" required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date de semis *</label>
            <Input type="date" value={form.sown_date} onChange={e => setForm(f => ({ ...f, sown_date: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Durée estimée (jours) *</label>
            <Input type="number" min={1} max={365} value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Plateaux</label>
            <Input type="number" min={1} value={form.quantity_plateaux} onChange={e => setForm(f => ({ ...f, quantity_plateaux: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optionnel" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Ajouter
            </Button>
          </div>
        </form>
      </div>

      {/* Liste des lots */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Variété</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Semé le</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Écoulés</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Durée</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Plateaux</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Statut</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Aucun lot enregistré</td></tr>
            )}
            {batches.map(b => {
              const elapsed = daysElapsed(b.sown_date)
              const remaining = b.estimated_days - elapsed
              const progress = Math.min(100, Math.round((elapsed / b.estimated_days) * 100))
              const isReady = remaining <= 0
              return (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {b.variety_name}
                    {b.notes && <p className="text-xs text-muted-foreground mt-0.5">{b.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmt(b.sown_date)}</td>
                  <td className="px-4 py-3 text-center font-semibold">{elapsed}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{b.estimated_days}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{b.quantity_plateaux}</td>
                  <td className="px-4 py-3">
                    {isReady
                      ? <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[11px]">Prêt 🎉</Badge>
                      : (
                        <div className="min-w-[90px]">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24 mb-1">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">Dans {remaining} j</span>
                        </div>
                      )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditTarget({ ...b })}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Éditer
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(b)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog édition */}
      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifier le lot</DialogTitle></DialogHeader>
          {editTarget && (
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-3 pt-2">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Variété *</label>
                <Input value={editTarget.variety_name} onChange={e => setEditTarget(t => ({ ...t, variety_name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date de semis *</label>
                <Input type="date" value={editTarget.sown_date} onChange={e => setEditTarget(t => ({ ...t, sown_date: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Durée (jours) *</label>
                <Input type="number" min={1} value={editTarget.estimated_days} onChange={e => setEditTarget(t => ({ ...t, estimated_days: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Plateaux</label>
                <Input type="number" min={1} value={editTarget.quantity_plateaux} onChange={e => setEditTarget(t => ({ ...t, quantity_plateaux: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <Input value={editTarget.notes ?? ''} onChange={e => setEditTarget(t => ({ ...t, notes: e.target.value }))} />
              </div>
              <DialogFooter className="col-span-2 pt-2">
                <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer ce lot ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Voulez-vous supprimer <strong>{deleteTarget?.variety_name}</strong> ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
