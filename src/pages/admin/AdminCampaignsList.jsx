import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus, Loader2, MessageSquare, Mail, Send } from 'lucide-react'

const STATUS_STYLES = {
  draft:     'bg-zinc-100 text-zinc-600 border-zinc-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  sending:   'bg-amber-50 text-amber-700 border-amber-200',
  sent:      'bg-green-50 text-green-700 border-green-200',
  failed:    'bg-red-50 text-red-700 border-red-200',
}
const CHANNEL_ICON = { sms: MessageSquare, email: Mail, both: Send }

function fmtDate(d, lang) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminCampaignsList() {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('message_campaigns').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast({ title: t('adminCampaigns.error'), description: error.message, variant: 'destructive' })
        setRows(data ?? [])
        setLoading(false)
      })
  }, [t])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" />{t('adminCampaigns.title')}</h1>
        <Button size="sm" asChild className="gap-1.5">
          <Link to="/admin/campagnes/nouvelle"><Plus className="h-4 w-4" />{t('adminCampaigns.newCampaign')}</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> {t('adminCampaigns.loading')}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {t('adminCampaigns.empty')}
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                {['campaign', 'channel', 'status', 'recipients', 'sent', 'failed', 'createdOn'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{t(`adminCampaigns.col.${h}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(c => {
                const stCls = STATUS_STYLES[c.status] ?? 'bg-muted'
                const stLabel = t(`adminCampaigns.status.${c.status}`, { defaultValue: c.status })
                const Icon = CHANNEL_ICON[c.channel] ?? Send
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link to={`/admin/campagnes/${c.id}`} className="font-medium text-zinc-900 hover:text-primary hover:underline">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />{c.channel === 'both' ? t('adminCampaigns.channelBoth') : c.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${stCls}`}>{stLabel}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{c.recipients_count}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{c.sent_count}</td>
                    <td className="px-4 py-3 text-center text-red-500">{c.failed_count || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(c.created_at, i18n.language)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
