import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import AdminProductForm from './AdminProductForm'

const INITIAL = {
  sku: '',
  name_fr: '',
  name_en: '',
  category: '',
  price_mur: '',
  unit: 'plant',
  description: '',
  is_active: true,
}

export default function AdminProductCreate() {
  const navigate = useNavigate()

  async function handleSubmit(values) {
    const { error } = await supabase.from('products').insert({
      sku: values.sku,
      name_fr: values.name_fr,
      name_en: values.name_en || values.name_fr,
      category: values.category,
      price_mur: parseFloat(values.price_mur),
      unit: values.unit || 'plant',
      description_fr: values.description,
      description_en: values.description,
      is_active: values.is_active,
    })
    if (error) {
      toast({ title: 'Erreur création', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Produit créé ✓', description: values.name_fr })
      navigate('/admin/produits')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nouveau produit</h1>
      <AdminProductForm initialValues={INITIAL} onSubmit={handleSubmit} />
    </div>
  )
}
