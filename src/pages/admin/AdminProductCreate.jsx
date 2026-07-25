import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      toast({ title: t('adminCatalog.create.createError'), description: error.message, variant: 'destructive' })
    } else {
      toast({ title: t('adminCatalog.create.created'), description: values.name_fr })
      navigate('/admin/produits')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('adminCatalog.create.title')}</h1>
      <AdminProductForm initialValues={INITIAL} onSubmit={handleSubmit} />
    </div>
  )
}
