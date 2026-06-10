import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ activeProducts: 0, totalOrders: 0, pendingOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]).then(([{ count: ap }, { count: to }, { count: po }]) => {
      setStats({ activeProducts: ap ?? 0, totalOrders: to ?? 0, pendingOrders: po ?? 0 })
      setLoading(false)
    })
  }, [])

  const kpis = [
    { label: 'Produits actifs', value: stats.activeProducts, icon: Package, color: 'text-green-600' },
    { label: 'Commandes totales', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Commandes en attente', value: stats.pendingOrders, icon: Clock, color: 'text-orange-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? '—' : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
