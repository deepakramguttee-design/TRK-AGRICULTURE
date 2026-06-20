import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import AdminProductForm from './AdminProductForm'

const BUCKET = 'product-images'

function isBucketUrl(url) {
  return url?.includes(`/storage/v1/object/public/${BUCKET}/`)
}

function extractFilename(url) {
  return url?.split(`/product-images/`).pop()
}

export default function AdminProductEdit() {
  const { sku } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast({ title: 'Produit introuvable', variant: 'destructive' })
          navigate('/admin/produits', { replace: true })
        } else {
          setProduct(data)
          setImageUrl(data.image_url ?? null)
        }
        setLoading(false)
      })
  }, [sku, navigate])

  async function handleImageUpload(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast({ title: 'Format non supporté', description: 'Accepté : JPG, PNG, WebP', variant: 'destructive' })
      return
    }
    setUploading(true)
    try {
      // Supprimer l'ancien fichier du bucket seulement s'il y était (pas si URL Facebook)
      if (isBucketUrl(imageUrl)) {
        const oldFilename = extractFilename(imageUrl)
        if (oldFilename) await supabase.storage.from(BUCKET).remove([oldFilename])
      }

      const ext = file.name.split('.').pop().toLowerCase()
      const filename = `${sku}-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filename, file, { contentType: file.type })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename)

      const { error: dbErr } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('sku', sku)
      if (dbErr) throw dbErr

      setImageUrl(publicUrl)
      toast({ title: 'Photo mise à jour ✓' })
    } catch (e) {
      toast({ title: 'Erreur upload', description: e.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  async function handleImageDelete() {
    if (!window.confirm('Supprimer la photo de ce produit ?')) return
    setUploading(true)
    try {
      // Supprimer du bucket seulement si c'est une URL bucket (pas Facebook)
      if (isBucketUrl(imageUrl)) {
        const filename = extractFilename(imageUrl)
        if (filename) await supabase.storage.from(BUCKET).remove([filename])
      }

      const { error } = await supabase
        .from('products')
        .update({ image_url: null })
        .eq('sku', sku)
      if (error) throw error

      setImageUrl(null)
      toast({ title: 'Photo supprimée' })
    } catch (e) {
      toast({ title: 'Erreur suppression', description: e.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(values) {
    const { error } = await supabase
      .from('products')
      .update({
        name_fr: values.name_fr,
        name_en: values.name_en || values.name_fr,
        category: values.category,
        price_mur: parseFloat(values.price_mur),
        unit: values.unit || 'plant',
        description_fr: values.description,
        is_active: values.is_active,
      })
      .eq('sku', sku)
    if (error) {
      toast({ title: 'Erreur mise à jour', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Produit mis à jour ✓', description: values.name_fr })
      navigate('/admin/produits')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Modifier le produit</h1>
      <p className="text-sm text-muted-foreground mb-6">SKU : {product.sku}</p>
      <AdminProductForm
        initialValues={{
          sku: product.sku,
          name_fr: product.name_fr ?? '',
          name_en: product.name_en ?? '',
          category: product.category ?? '',
          price_mur: product.price_mur ?? '',
          unit: product.unit ?? 'plant',
          description: product.description_fr ?? '',
          is_active: product.is_active ?? true,
        }}
        onSubmit={handleSubmit}
        isEdit
        imageUrl={imageUrl}
        uploading={uploading}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
      />
    </div>
  )
}
