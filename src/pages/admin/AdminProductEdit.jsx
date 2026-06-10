import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import AdminProductForm from './AdminProductForm'

export default function AdminProductEdit() {
  const { sku } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

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
        }
        setLoading(false)
      })
  }, [sku, navigate])

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
      />
    </div>
  )
}
