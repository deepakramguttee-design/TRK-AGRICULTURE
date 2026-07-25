import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Upload, Image as ImageIcon, Loader2, ShieldAlert, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'

const CATEGORY_EMOJI = {
  epices: '🌿', salades: '🥬', bredes: '🍃', legumes: '🥕', melons: '🍈',
}

const STATUS_OPTIONS = [
  { value: 'available',     className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'in_production', className: 'text-amber-700  bg-amber-50  border-amber-200'  },
  { value: 'coming_soon',   className: 'text-blue-700   bg-blue-50   border-blue-200'   },
]

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
  const { t } = useTranslation()
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
  const [savingStatus, setSavingStatus] = useState(null)    // sku being saved
  const [savingActive, setSavingActive] = useState(null)    // sku being toggled
  const [editingProduct, setEditingProduct] = useState(null) // product being edited (names/desc)
  const [savingProduct, setSavingProduct] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/', { replace: true }); return }
    supabase
      .from('products')
      .select('id, sku, name_fr, name_en, description_fr, description_en, category, price_mur, unit, image_url, is_active, status')
      .order('category')
      .order('name_fr')
      .then(({ data, error }) => {
        if (error) toast({ title: t('adminCatalog.legacy.loadError'), description: error.message, variant: 'destructive' })
        else setProducts(data || [])
        setLoading(false)
      })
  }, [user, navigate, t])

  async function handleUpload(product, file) {
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast({ title: t('adminCatalog.legacy.formatUnsupported'), description: t('adminCatalog.legacy.formatAccepted'), variant: 'destructive' })
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
      toast({ title: t('adminCatalog.legacy.photoUpdated'), description: product.name_fr })
    } catch (e) {
      toast({ title: t('adminCatalog.legacy.uploadError'), description: e.message, variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  async function handleDeleteImage(product) {
    if (!window.confirm(t('adminCatalog.legacy.confirmDeletePhoto', { name: product.name_fr }))) return
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
      toast({ title: t('adminCatalog.legacy.photoDeleted'), description: product.name_fr })
    } catch (e) {
      toast({ title: t('adminCatalog.legacy.deleteError'), description: e.message, variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
  }

  async function handleSaveProduct() {
    if (!editingProduct) return
    const { sku, name_fr, name_en, description_fr, description_en } = editingProduct
    if (!name_fr.trim()) { toast({ title: t('adminCatalog.legacy.nameFrRequired'), variant: 'destructive' }); return }
    const patch = { name_fr: name_fr.trim(), name_en: name_en?.trim() || null, description_fr: description_fr?.trim() || null, description_en: description_en?.trim() || null }
    setSavingProduct(true)
    try {
      const { error } = await supabase.from('products').update(patch).eq('sku', sku)
      if (error) throw error
      setProducts(prev => prev.map(p => p.sku === sku ? { ...p, ...patch } : p))
      toast({ title: t('adminCatalog.legacy.productUpdated'), description: patch.name_fr })
      setEditingProduct(null)
    } catch (e) {
      toast({ title: t('adminCatalog.legacy.error'), description: e.message, variant: 'destructive' })
    } finally {
      setSavingProduct(false)
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
      toast({ title: t('adminCatalog.legacy.priceInvalid'), description: t('adminCatalog.legacy.priceInvalidDesc'), variant: 'destructive' })
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
      toast({ title: t('adminCatalog.legacy.priceUpdated'), description: `${product.name_fr} → Rs ${rounded}` })
    } catch (e) {
      toast({ title: t('adminCatalog.legacy.priceError'), description: e.message, variant: 'destructive' })
    } finally {
      setSavingPrice(null)
    }
  }

  async function handleStatusChange(product, newStatus) {
    if (newStatus === product.status) return
    setSavingStatus(product.sku)
    try {
      const { error } = await supabase.from('products').update({ status: newStatus }).eq('sku', product.sku)
      if (error) throw error
      setProducts(prev => prev.map(p => p.sku === product.sku ? { ...p, status: newStatus } : p))
      const label = t(`adminCatalog.status.${newStatus}`, { defaultValue: newStatus })
      toast({ title: t('adminCatalog.legacy.statusUpdated'), description: `${product.name_fr} → ${label}` })
    } catch (e) {
      toast({ title: t('adminCatalog.legacy.statusError'), description: e.message, variant: 'destructive' })
    } finally {
      setSavingStatus(null)
    }
  }

  async function handleToggleActive(product) {
    setSavingActive(product.sku)
    try {
      const next = !product.is_active
      const { error } = await supabase.from('products').update({ is_active: next }).eq('sku', product.sku)
      if (error) throw error
      setProducts(prev => prev.map(p => p.sku === product.sku ? { ...p, is_active: next } : p))
      toast({ title: next ? t('adminCatalog.legacy.productActivated') : t('adminCatalog.legacy.productHidden'), description: product.name_fr })
    } catch (e) {
      toast({ title: t('adminCatalog.legacy.activationError'), description: e.message, variant: 'destructive' })
    } finally {
      setSavingActive(null)
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
        {t('adminCampaigns.loading')}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('adminCatalog.legacy.title')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t('adminCatalog.legacy.subtitle', { count: products.length })}
          </p>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">{t('adminCatalog.legacy.col.sku')}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('adminCatalog.legacy.col.name')}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-36">{t('adminCatalog.legacy.col.category')}</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-24">{t('adminCatalog.legacy.col.priceRs')}</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-36">{t('adminCatalog.legacy.col.status')}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-16">{t('adminCatalog.legacy.col.active')}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-20">{t('adminCatalog.legacy.col.photo')}</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-40">{t('adminCatalog.legacy.col.action')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const isUploading = uploading === product.sku
              const isDeleting = deleting === product.sku
              const isSavingPrice = savingPrice === product.sku
              const isEditingPrice = editingPrice?.sku === product.sku
              const isSavingStatus = savingStatus === product.sku
              const isSavingActive = savingActive === product.sku
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

                  {/* Nom — clic pour éditer */}
                  <td className="px-4 py-3">
                    <button
                      className="group flex items-center gap-1.5 text-left font-medium hover:text-primary transition-colors"
                      onClick={() => setEditingProduct({ ...product })}
                      title={t('adminCatalog.legacy.editNameTitle')}
                    >
                      {product.name_fr}
                      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  </td>

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
                        title={t('adminCatalog.legacy.priceEditTitle')}
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

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      {isSavingStatus && (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground pointer-events-none" />
                      )}
                      <select
                        value={product.status || 'available'}
                        disabled={isSavingStatus}
                        onChange={e => handleStatusChange(product, e.target.value)}
                        className={`w-full text-xs font-medium rounded px-2 py-1 border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${
                          STATUS_OPTIONS.find(o => o.value === (product.status || 'available'))?.className ?? ''
                        }`}
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{t(`adminCatalog.status.${o.value}`)}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Actif */}
                  <td className="px-4 py-3 text-center">
                    {isSavingActive ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
                    ) : (
                      <button
                        onClick={() => handleToggleActive(product)}
                        title={product.is_active ? t('adminCatalog.legacy.hide') : t('adminCatalog.legacy.activateHint')}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          product.is_active ? 'bg-emerald-500' : 'bg-muted'
                        }`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          product.is_active ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
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
                        {isUploading ? t('adminCatalog.legacy.uploading') : product.image_url ? t('adminCatalog.legacy.replace') : t('adminCatalog.legacy.uploadPhoto')}
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
                          {isDeleting ? '…' : t('adminCatalog.legacy.delete')}
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

      {/* Modal édition nom + description */}
      <Dialog open={!!editingProduct} onOpenChange={open => { if (!open) setEditingProduct(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('adminCatalog.legacy.editTitle')}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('adminCatalog.form.nameFrLabel')}</label>
                  <input
                    className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    value={editingProduct.name_fr || ''}
                    onChange={e => setEditingProduct(p => ({ ...p, name_fr: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t('adminCatalog.form.nameEnLabel')}</label>
                  <input
                    className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    value={editingProduct.name_en || ''}
                    onChange={e => setEditingProduct(p => ({ ...p, name_en: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('adminCatalog.detail.descriptionFr')}</label>
                <textarea
                  rows={3}
                  className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background resize-none"
                  value={editingProduct.description_fr || ''}
                  onChange={e => setEditingProduct(p => ({ ...p, description_fr: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t('adminCatalog.detail.descriptionEn')}</label>
                <textarea
                  rows={3}
                  className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background resize-none"
                  value={editingProduct.description_en || ''}
                  onChange={e => setEditingProduct(p => ({ ...p, description_en: e.target.value }))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">{t('adminCatalog.form.cancel')}</Button>
            </DialogClose>
            <Button size="sm" disabled={savingProduct} onClick={handleSaveProduct}>
              {savingProduct ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              {t('adminCatalog.legacy.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
