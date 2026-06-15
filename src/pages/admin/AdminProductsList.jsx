import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Loader2, Image as ImageIcon } from 'lucide-react'

const CATEGORY_EMOJI = {
  epices: '🌿', salades: '🥬', bredes: '🍃', legumes: '🥕', melons: '🍈',
}
const CATEGORIES = ['epices', 'salades', 'bredes', 'legumes', 'melons']

export default function AdminProductsList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(null)

  async function load() {
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name_fr, category, price_mur, unit, image_url, is_active')
      .order('category')
      .order('name_fr')
    if (error) toast({ title: 'Erreur chargement', description: error.message, variant: 'destructive' })
    else setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleToggleActive(product) {
    setToggling(product.sku)
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('sku', product.sku)
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    } else {
      setProducts(prev => prev.map(p => p.sku === product.sku ? { ...p, is_active: !p.is_active } : p))
    }
    setToggling(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('sku', deleteTarget.sku)
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Produit désactivé' })
      setProducts(prev => prev.map(p => p.sku === deleteTarget.sku ? { ...p, is_active: false } : p))
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name_fr.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchCat = !filterCat || p.category === filterCat
    return matchSearch && matchCat
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} produits au total</p>
        </div>
        <Button asChild>
          <Link to="/admin/produits/nouveau">
            <Plus className="h-4 w-4 mr-1.5" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Rechercher par nom ou SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-56"
        />
        <Button
          size="sm"
          variant={!filterCat ? 'default' : 'outline'}
          onClick={() => setFilterCat('')}
        >
          Toutes
        </Button>
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={filterCat === cat ? 'default' : 'outline'}
            onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
            className="gap-1"
          >
            {CATEGORY_EMOJI[cat]} {cat}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nom FR</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Catégorie</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Prix Rs</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Image</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actif</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr
                key={product.sku}
                className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                  !product.is_active ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {product.sku}
                  </code>
                </td>
                <td className="px-4 py-3 font-medium">
                  <Link to={`/admin/produits/${product.sku}`} className="hover:text-primary hover:underline underline-offset-2 transition-colors">
                    {product.name_fr}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs gap-1">
                    {CATEGORY_EMOJI[product.category]} {product.category}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-primary">
                  Rs {Number(product.price_mur).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="mx-auto w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name_fr} className="w-full h-full object-cover" />
                      : <ImageIcon className="h-3 w-3 text-muted-foreground/40" />
                    }
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={product.is_active}
                    disabled={toggling === product.sku}
                    onClick={() => handleToggleActive(product)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                      product.is_active ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                        product.is_active ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/admin/produits/${product.sku}/editer`}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Éditer
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">Aucun produit trouvé</p>
        )}
      </div>

      {/* Confirmation suppression */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désactiver ce produit ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr ? Cette action est irréversible.{' '}
              <strong>{deleteTarget?.name_fr}</strong> sera masqué du catalogue public mais conservé en base de données.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
