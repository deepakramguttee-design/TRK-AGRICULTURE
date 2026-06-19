import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Image as ImageIcon, Loader2, ShieldAlert, Trash2, Pencil, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const CATEGORY_EMOJI = {
  epices: '🌿', salades: '🥬', bredes: '🍃', legumes: '🥕', melons: '🍈',
}

async function resizeToMax(file, maxWidth = 1200) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width <= maxWidth) { resolve(file); return }
      const scale = maxWidth / img.width
      const canvas = document.createElement('canvas')
      canvas.width = maxWidth
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => resolve(new File([blob], file.name, { type: file.type })),
        file.type,
        0.85,
      )
    }
    img.src = url
  })
}

export default function AdminProducts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRefs = useRef({})

  const priceInputRef = useRef(null)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)          // sku being uploaded
  const [deleting, setDeleting] = useState(null)            // sku being deleted
  const [dragOver, setDragOver] = useState(null)            // sku being dragged over
  const [editingPrice, setEditingPrice] = useState(null)    // { sku, value }
  const [savingPrice, setSavingPrice] = useState(null)      // sku being saved

  useEffect(() => {
    if (!user) { navigate('/', { replace: true }); return }
    supabase
      .from('products')
      .select('id, sku, name_fr, category, price_mur, unit, image_url, is_active')
      .order('category')
      .order('name_fr')
      .then(({ data, error }) => {
        if (error) toast({ title: 'Erreur chargement', description: error.message, variant: 'destructive' })
        else setProducts(data || [])
        setLoading(false)
      })
  }, [user, navigate])

  async function handleUpload(product, file) {
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast({ title: 'Format non supporté', description: 'Accepté : JPG, PNG, WebP', variant: 'destructive' })
      return
    }
    setUploading(product.sku)
    try {
      const resized = await resizeToMax(file)
      const ext = file.name.split('.').pop().toLowerCase().replace('jpg', 'jpeg') === 'jpeg' ? 'jpg' : file.name.split('.').pop().toLowerCase()
      const path = `${product.sku}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, resized, { upsert: true, contentType: file.type })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      const { error: dbErr } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('sku', product.sku)
      if (dbErr) throw dbErr

      setProducts(prev =>
        prev.map(p => p.sku === product.sku ? { ...p, image_url: publicUrl } : p)
      )
      toast({ title: 'Photo mise à jour ✓', description: product.name_fr })
    } catch (e) {
      toast({ title: 'Erreur upload', description: e.message, variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  async function handleDeleteImage(product) {
    if (!window.confirm(`Supprimer la photo de "${product.name_fr}" ?`)) return
    setDeleting(product.sku)
    try {
      // Remove from Storage only if it's a Supabase Storage URL
      if (product.image_url?.includes('/storage/v1/object/public/product-images/')) {
        const filename = product.image_url.split('/product-images/').pop()
        const { error: storageErr } = await supabase.storage
          .from('product-images')
          .remove([filename])
        if (storageErr) throw storageErr
      }

      const { error: dbErr } = await supabase
        .from('products')
        .update({ image_url: null })
        .eq('sku', product.sku)
      if (dbErr) throw dbErr

      setProducts(prev =>
        prev.map(p => p.sku === product.sku ? { ...p, image_url: null } : p)
      )
      toast({ title: 'Photo supprimée', description: product.name_fr })
    } catch (e) {
      toast({ title: 'Erreur suppression', description: e.message, variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
  }

  function startEditPrice(product) {
    setEditingPrice({ sku: product.sku, value: String(Number(product.price_mur)) })
    setTimeout(() => priceInputRef.current?.select(), 0)
  }

  function cancelEditPrice() {
    setEditingPrice(null)
  }

  async function savePrice(product) {
    const parsed = parseFloat(editingPrice.value)
    if (isNaN(parsed) || parsed < 0) {
      toast({ title: 'Prix invalide', description: 'Entrez un nombre positif', variant: 'destructive' })
      return
    }
    const rounded = Math.round(parsed * 100) / 100
    if (rounded === Number(product.price_mur)) { setEditingPrice(null); return }

    setSavingPrice(product.sku)
    setEditingPrice(null)
    try {
      const { error } = await supabase
        .from('products')
        .update({ price_mur: rounded })
        .eq('sku', product.sku)
      if (error) throw error
      setProducts(prev =>
        prev.map(p => p.sku === product.sku ? { ...p, price_mur: rounded } : p)
      )
      toast({ title: 'Prix mis à jour ✓', description: `${product.name_fr} → Rs ${rounded}` })
    } catch (e) {
      toast({ title: 'Erreur prix', description: e.message, variant: 'destructive' })
    } finally {
      setSavingPrice(null)
    }
  }

  function openFilePicker(sku) {
    fileInputRefs.current[sku]?.click()
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement…
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin — Produits</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {products.length} produits · Cliquez sur un prix pour le modifier · Glissez une image pour l'uploader
          </p>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">SKU</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nom</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-36">Catégorie</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-24">Prix Rs</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-20">Photo</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-40">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const isUploading = uploading === product.sku
              const isDeleting = deleting === product.sku
              const isSavingPrice = savingPrice === product.sku
              const isEditingPrice = editingPrice?.sku === product.sku
              const isDragTarget = dragOver === product.sku
              return (
                <tr
                  key={product.sku}
                  className={`border-b last:border-0 transition-colors ${
                    isDragTarget ? 'bg-primary/5 outline outline-2 outline-primary/30' : 'hover:bg-muted/30'
                  } ${!product.is_active ? 'opacity-50' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(product.sku) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={async e => {
                    e.preventDefault()
                    setDragOver(null)
                    const file = e.dataTransfer.files[0]
                    if (file) handleUpload(product, file)
                  }}
                >
                  {/* SKU */}
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {product.sku}
                    </code>
                  </td>

                  {/* Nom */}
                  <td className="px-4 py-3 font-medium">{product.name_fr}</td>

                  {/* Catégorie */}
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs gap-1">
                      {CATEGORY_EMOJI[product.category]} {product.category}
                    </Badge>
                  </td>

                  {/* Prix — éditable inline */}
                  <td className="px-4 py-3 text-right">
                    {isEditingPrice ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-muted-foreground">Rs</span>
                        <input
                          ref={priceInputRef}
                          type="number"
                          min="0"
                          step="0.5"
                          value={editingPrice.value}
                          onChange={e => setEditingPrice(prev => ({ ...prev, value: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') savePrice(product)
                            if (e.key === 'Escape') cancelEditPrice()
                          }}
                          onBlur={() => savePrice(product)}
                          className="w-20 text-right text-sm font-semibold border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                        />
                      </div>
                    ) : (
                      <button
                        className="group inline-flex items-center justify-end gap-1.5 text-right w-full hover:text-primary transition-colors"
                        onClick={() => startEditPrice(product)}
                        disabled={isSavingPrice}
                        title="Cliquer pour modifier le prix"
                      >
                        {isSavingPrice
                          ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          : <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        }
                        <span className="font-semibold text-primary">
                          Rs {Number(product.price_mur).toFixed(2)}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          / {product.unit}
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Aperçu */}
                  <td className="px-4 py-3">
                    <div className="mx-auto w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name_fr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </div>
                  </td>

                  {/* Upload / Delete */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        ref={el => { fileInputRefs.current[product.sku] = el }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => handleUpload(product, e.target.files[0])}
                        onClick={e => { e.target.value = '' }}
                      />
                      <Button
                        size="sm"
                        variant={product.image_url ? 'outline' : 'default'}
                        className="text-xs gap-1.5"
                        disabled={isUploading || isDeleting}
                        onClick={() => openFilePicker(product.sku)}
                      >
                        {isUploading
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Upload className="h-3 w-3" />
                        }
                        {isUploading ? 'Upload…' : product.image_url ? 'Remplacer' : 'Upload photo'}
                      </Button>
                      {product.image_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isUploading || isDeleting}
                          onClick={() => handleDeleteImage(product)}
                        >
                          {isDeleting
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />
                          }
                          {isDeleting ? '…' : 'Supprimer'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
