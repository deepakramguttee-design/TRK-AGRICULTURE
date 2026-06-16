import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import {
  User, Package, Shield, LayoutDashboard, LogOut, Pencil, X,
  Loader2, ChevronRight,
} from 'lucide-react'

const STATUS_COLORS = {
  pending:          'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:        'bg-blue-50 text-blue-700 border-blue-200',
  preparing:        'bg-purple-50 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered:        'bg-green-50 text-green-700 border-green-200',
  cancelled:        'bg-red-50 text-red-700 border-red-200',
}

export default function Account() {
  const { t } = useTranslation()
  const { user, isAdmin, loading, signOut } = useAuth()

  const isOtpUser = user?.app_metadata?.provider === 'phone'

  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', address: '', district: '', preferred_lang: 'fr' })
  const [saving, setSaving] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [pwForm, setPwForm] = useState({ new_pw: '', confirm_pw: '' })
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchProfile()
    fetchOrders()
  }, [user])

  async function fetchProfile() {
    const { data } = await supabase
      .from('customers')
      .select('full_name, phone, address, district, account_type, company_name, preferred_lang')
      .eq('id', user.id)
      .single()
    if (data) {
      setProfile(data)
      setEditForm({
        full_name: data.full_name ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        district: data.district ?? '',
        preferred_lang: data.preferred_lang ?? 'fr',
      })
    }
  }

  async function fetchOrders() {
    setOrdersLoading(true)
    let q = supabase
      .from('orders')
      .select('order_number, status, total_mur, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    if (user.email) {
      q = q.or(`customer_id.eq.${user.id},guest_email.eq.${user.email}`)
    } else {
      q = q.eq('customer_id', user.id)
    }
    const { data } = await q
    setOrders(data ?? [])
    setOrdersLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    const { error } = await supabase
      .from('customers')
      .update({
        full_name: editForm.full_name.trim() || null,
        phone: editForm.phone.trim() || null,
        address: editForm.address.trim() || null,
        district: editForm.district.trim() || null,
        preferred_lang: editForm.preferred_lang,
      })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      toast({ title: t('account.error'), description: error.message, variant: 'destructive' })
    } else {
      setProfile(p => ({ ...p, ...editForm }))
      setEditing(false)
      toast({ title: t('account.profile.saved') })
    }
  }

  async function changePassword() {
    if (pwForm.new_pw.length < 6) {
      toast({ title: t('account.password.tooShort'), variant: 'destructive' }); return
    }
    if (pwForm.new_pw !== pwForm.confirm_pw) {
      toast({ title: t('account.password.mismatch'), variant: 'destructive' }); return
    }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.new_pw })
    setPwSaving(false)
    if (error) {
      toast({ title: t('account.error'), description: error.message, variant: 'destructive' })
    } else {
      setPwForm({ new_pw: '', confirm_pw: '' })
      toast({ title: t('account.password.success') })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6.25rem)] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const displayId = user.email || (user.phone ? `+${user.phone}` : '—')
  const initials = (profile?.full_name || displayId).slice(0, 2).toUpperCase()

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{profile?.full_name || displayId}</p>
          <p className="text-sm text-muted-foreground truncate">{displayId}</p>
          {profile?.account_type === 'b2b' && (
            <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 font-medium">
              B2B
            </span>
          )}
        </div>
      </div>

      {/* ── Profil ── */}
      <AccountCard icon={User} title={t('account.profile.title')}>
        {editing ? (
          <div className="space-y-4">
            <Field label={t('account.profile.name')}>
              <Input
                value={editForm.full_name}
                onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder={t('account.profile.namePlaceholder')}
              />
            </Field>
            <Field label={t('account.profile.phone')}>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="52 345 678"
              />
            </Field>
            <Field label="Adresse de livraison">
              <Input
                value={editForm.address}
                onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Rue, village"
              />
            </Field>
            <Field label="District">
              <Input
                value={editForm.district}
                onChange={e => setEditForm(f => ({ ...f, district: e.target.value }))}
                placeholder="Ex : Pamplemousses"
              />
            </Field>
            <Field label={t('account.profile.lang')}>
              <Select value={editForm.preferred_lang} onValueChange={v => setEditForm(f => ({ ...f, preferred_lang: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex gap-2 pt-1">
              <Button onClick={saveProfile} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('account.profile.save')}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-1" />{t('account.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow label={t('account.profile.name')} value={profile?.full_name || '—'} />
            <InfoRow label={t('account.profile.phone')} value={profile?.phone || '—'} />
            {profile?.address && <InfoRow label="Adresse" value={profile.address} />}
            {profile?.district && <InfoRow label="District" value={profile.district} />}
            <InfoRow label={t('account.profile.lang')} value={profile?.preferred_lang === 'en' ? 'English' : 'Français'} />
            {profile?.company_name && (
              <InfoRow label={t('account.profile.company')} value={profile.company_name} />
            )}
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="mt-2">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />{t('account.profile.edit')}
            </Button>
          </div>
        )}
      </AccountCard>

      {/* ── Commandes ── */}
      <AccountCard icon={Package} title={t('account.orders.title')}>
        {ordersLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm mb-3">{t('account.orders.empty')}</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/catalogue">{t('account.orders.discover')}</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map(o => (
              <div key={o.order_number} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleDateString('fr-MU', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={o.status} t={t} />
                  <span className="text-sm font-semibold">Rs {Number(o.total_mur).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AccountCard>

      {/* ── Mot de passe — masqué pour users OTP ── */}
      {!isOtpUser && (
        <AccountCard icon={Shield} title={t('account.password.title')}>
          <div className="space-y-4">
            <Field label={t('account.password.new')}>
              <Input
                type="password"
                value={pwForm.new_pw}
                onChange={e => setPwForm(f => ({ ...f, new_pw: e.target.value }))}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Field label={t('account.password.confirm')}>
              <Input
                type="password"
                value={pwForm.confirm_pw}
                onChange={e => setPwForm(f => ({ ...f, confirm_pw: e.target.value }))}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Button
              onClick={changePassword}
              disabled={pwSaving || !pwForm.new_pw || !pwForm.confirm_pw}
              variant="outline"
            >
              {pwSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('account.password.save')}
            </Button>
          </div>
        </AccountCard>
      )}

      {/* ── Admin ── */}
      {isAdmin && (
        <AccountCard icon={LayoutDashboard} title={t('account.admin.title')}>
          <Button variant="outline" className="w-full justify-between" asChild>
            <Link to="/admin">
              {t('account.admin.link')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </AccountCard>
      )}

      {/* ── Déconnexion ── */}
      <Button
        variant="ghost"
        className="w-full text-muted-foreground hover:text-destructive"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {t('account.signout')}
      </Button>
    </div>
  )
}

function AccountCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
        <Icon className="h-4 w-4 text-green-600" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StatusBadge({ status, t }) {
  const cls = STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      {t(`account.orders.status.${status}`, { defaultValue: status })}
    </span>
  )
}
