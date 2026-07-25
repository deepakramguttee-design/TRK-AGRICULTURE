import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'

const CATEGORY_VALUES = ['epices', 'salades', 'bredes', 'legumes', 'melons']

export default function AdminProductForm({
  initialValues,
  onSubmit,
  isEdit = false,
  imageUrl,
  uploading = false,
  onImageUpload,
  onImageDelete,
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  function set(field, value) {
    setValues(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name_fr' && !isEdit && prev.name_en === prev.name_fr) {
        next.name_en = value
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(values)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {!isEdit && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="sku">{t('adminCatalog.form.skuLabel')}</label>
          <Input
            id="sku"
            value={values.sku}
            onChange={e => set('sku', e.target.value.toUpperCase())}
            placeholder="EPI-001"
            required
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="name_fr">{t('adminCatalog.form.nameFrLabel')}</label>
        <Input
          id="name_fr"
          value={values.name_fr}
          onChange={e => set('name_fr', e.target.value)}
          placeholder="Basilic Thai"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="name_en">{t('adminCatalog.form.nameEnLabel')}</label>
        <Input
          id="name_en"
          value={values.name_en}
          onChange={e => set('name_en', e.target.value)}
          placeholder="Thai Basil"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('adminCatalog.form.categoryLabel')}</label>
        <Select value={values.category} onValueChange={v => set('category', v)} required>
          <SelectTrigger>
            <SelectValue placeholder={t('adminCatalog.form.categoryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_VALUES.map(cat => (
              <SelectItem key={cat} value={cat}>{t(`adminCatalog.form.categories.${cat}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="price_mur">{t('adminCatalog.form.priceLabel')}</label>
          <Input
            id="price_mur"
            type="number"
            min="0"
            step="0.01"
            value={values.price_mur}
            onChange={e => set('price_mur', e.target.value)}
            placeholder="45.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="unit">{t('adminCatalog.form.unitLabel')}</label>
          <Input
            id="unit"
            value={values.unit}
            onChange={e => set('unit', e.target.value)}
            placeholder="plant"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="description">{t('adminCatalog.form.descriptionLabel')}</label>
        <textarea
          id="description"
          value={values.description}
          onChange={e => set('description', e.target.value)}
          placeholder={t('adminCatalog.form.descriptionPlaceholder')}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      {isEdit && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('adminCatalog.form.photoLabel')}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => { if (e.target.files[0]) onImageUpload(e.target.files[0]) }}
            onClick={e => { e.target.value = '' }}
          />
          {imageUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt={t('adminCatalog.form.preview')}
                className="w-[100px] h-[100px] rounded-md object-cover border bg-muted flex-shrink-0"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  {uploading
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Upload className="h-3 w-3" />
                  }
                  {uploading ? t('adminCatalog.form.inProgress') : t('adminCatalog.form.replace')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={uploading}
                  onClick={onImageDelete}
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                  {t('adminCatalog.form.delete')}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              {uploading
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <ImageIcon className="h-3 w-3" />
              }
              {uploading ? t('adminCatalog.form.inProgress') : t('adminCatalog.form.addPhoto')}
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={values.is_active}
          onClick={() => set('is_active', !values.is_active)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            values.is_active ? 'bg-primary' : 'bg-input'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
              values.is_active ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span
          className="text-sm font-medium cursor-pointer"
          onClick={() => set('is_active', !values.is_active)}
        >
          {t('adminCatalog.form.activeToggle')}
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || uploading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? t('adminCatalog.form.update') : t('adminCatalog.form.create')}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link to="/admin/produits">{t('adminCatalog.form.cancel')}</Link>
        </Button>
      </div>
    </form>
  )
}
