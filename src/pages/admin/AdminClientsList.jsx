import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Users, Search, Building2, User, Plus, X, Loader2, Download,
  MessageSquare, Mail,
} from 'lucide-react'
import { isValidMauritiusPhone, DISTRICTS } from '@/lib/delivery'

const ACCOUNT_STYLES = {
  b2c: { labelKey: 'adminClients.common.particulier',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  b2b: { labelKey: 'adminClients.common.professionnel', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
}

function fmtDate(d, lang) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtMur(n) {
  return 'Rs ' + Number(n ?? 0).toLocaleString('en-MU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function NewClientModal({ onClose, onCreated }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', email: '',
    account_type: 'b2c', company_name: '', district: '',
  })
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!form.first_name.trim()) { toast({ title: t('adminClients.newModal.firstNameRequired'), variant: 'destructive' }); return }
    if (!form.phone.trim() || !isValidMauritiusPhone(form.phone)) {
      toast({ title: t('adminClients.newModal.phoneInvalid'), variant: 'destructive' }); return
    }
    setSaving(true)
    const phone = form.phone.trim().replace(/[\s\-().]/g, '')
    const { data, error } = await supabase.from('customers').insert({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || null,
      phone,
      email: form.email.trim().toLowerCase() || null,
      account_type: form.account_type,
      company_name: form.account_type === 'b2b' ? (form.company_name.trim() || null) : null,
      district: form.district || null,
      source: 'comptoir',
    }).select('id').single()
    setSaving(false)
    if (error) {
      const msg = /duplicate|unique/i.test(error.message)
        ? t('adminClients.newModal.duplicatePhone')
        : error.message
      toast({ title: t('adminClients.common.error'), description: msg, variant: 'destructive' })
      return
    }
    toast({ title: t('adminClients.newModal.created'), description: `${form.first_name} ${form.last_name}`.trim() })
    onCreated(data.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">{t('adminClients.newModal.title')}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.firstName')}</label>
              <Input className="mt-1" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.lastName')}</label>
              <Input className="mt-1" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.phone')}</label>
            <Input className="mt-1" type="tel" placeholder="52 345 678" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.email')}</label>
            <Input className="mt-1" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.type')}</label>
              <select value={form.account_type} onChange={e => setForm(p => ({ ...p, account_type: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input bg-white px-3 text-sm">
                <option value="b2c">{t('adminClients.common.particulier')}</option>
                <option value="b2b">{t('adminClients.common.professionnel')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.district')}</label>
              <select value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input bg-white px-3 text-sm">
                <option value="">—</option>
                {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>
          {form.account_type === 'b2b' && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase">{t('adminClients.newModal.company')}</label>
              <Input className="mt-1" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>{t('adminClients.common.cancel')}</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('adminClients.newModal.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminClientsList() {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('all')
  const [fDistrict, setFDistrict] = useState('all')
  const [fActive, setFActive] = useState('all')
  const [showNew, setShowNew] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('customers_admin')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast({ title: t('adminClients.common.error'), description: error.message, variant: 'destructive' })
    setRows(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const districts = useMemo(
    () => [...new Set(rows.map(r => r.district).filter(Boolean))].sort(),
    [rows],
  )

  const filtered = useMemo(() => rows.filter(c => {
    if (fType !== 'all' && c.account_type !== fType) return false
    if (fDistrict !== 'all' && c.district !== fDistrict) return false
    if (fActive === 'active' && !c.is_active) return false
    if (fActive === 'inactive' && c.is_active) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const hay = [c.full_name, c.company_name, c.phone, c.customer_code, c.email]
        .map(x => (x ?? '').toLowerCase()).join(' ')
      if (!hay.includes(q)) return false
    }
    return true
  }), [rows, fType, fDistrict, fActive, search])

  function exportCsv() {
    const cols = ['customer_code', 'full_name', 'company_name', 'phone', 'email', 'account_type',
      'district', 'orders_count', 'revenue_paid_mur', 'last_order_at', 'sms_opt_in', 'email_opt_in', 'is_active']
    const head = cols.join(',')
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = filtered.map(r => cols.map(c => esc(r[c])).join(','))
    const csv = [head, ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients_trk_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" />{t('adminClients.list.title')}</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!filtered.length} className="gap-1.5">
            <Download className="h-4 w-4" />{t('adminClients.list.exportCsv')}
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />{t('adminClients.list.newClient')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('adminClients.list.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={fType} onChange={e => setFType(e.target.value)} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">{t('adminClients.list.allTypes')}</option>
          <option value="b2c">{t('adminClients.common.particulier')}</option>
          <option value="b2b">{t('adminClients.common.professionnel')}</option>
        </select>
        <select value={fDistrict} onChange={e => setFDistrict(e.target.value)} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">{t('adminClients.list.allDistricts')}</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={fActive} onChange={e => setFActive(e.target.value)} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">{t('adminClients.list.activeAndInactive')}</option>
          <option value="active">{t('adminClients.list.active')}</option>
          <option value="inactive">{t('adminClients.list.inactive')}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> {t('adminClients.common.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {rows.length ? t('adminClients.list.noResults') : t('adminClients.list.noClients')}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                {[
                  t('adminClients.list.cols.code'), t('adminClients.list.cols.client'),
                  t('adminClients.list.cols.phone'), t('adminClients.list.cols.district'),
                  t('adminClients.list.cols.orders'), t('adminClients.list.cols.revenuePaid'),
                  t('adminClients.list.cols.last'), t('adminClients.list.cols.optIn'),
                ].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const typeStyle = ACCOUNT_STYLES[c.account_type]
                const typeLabel = typeStyle ? t(typeStyle.labelKey) : c.account_type
                const typeCls = typeStyle ? typeStyle.cls : 'bg-muted text-muted-foreground'
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.customer_code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {c.account_type === 'b2b' ? <Building2 className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <Link to={`/admin/clients/${c.id}`} className="font-medium text-zinc-900 hover:text-primary hover:underline">
                            {c.full_name || <span className="italic text-muted-foreground">{t('adminClients.common.noName')}</span>}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${typeCls}`}>{typeLabel}</span>
                            {c.company_name && <span className="text-xs text-muted-foreground">{c.company_name}</span>}
                            {!c.is_active && <span className="text-[10px] text-red-500 font-medium">{t('adminClients.list.inactiveBadge')}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{c.district || '—'}</td>
                    <td className="px-4 py-3 text-center">{c.orders_count ?? 0}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{fmtMur(c.revenue_paid_mur)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(c.last_order_at, i18n.language)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span title="SMS" className={`inline-flex items-center justify-center w-6 h-6 rounded ${c.sms_opt_in ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-300'}`}>
                          <MessageSquare className="h-3 w-3" />
                        </span>
                        <span title="Email" className={`inline-flex items-center justify-center w-6 h-6 rounded ${c.email_opt_in ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-300'}`}>
                          <Mail className="h-3 w-3" />
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">{t('adminClients.list.count', { count: filtered.length })}</p>

      {showNew && <NewClientModal onClose={() => setShowNew(false)} onCreated={() => load()} />}
    </div>
  )
}
