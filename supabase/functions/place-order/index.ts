import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://trk-agriculture.netlify.app',
  'http://localhost:5174',
  'http://localhost:4173',
]

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

const MAX_ITEM_QUANTITY = 500

function json(body: unknown, status = 200, req?: Request) {
  const headers = req ? corsHeaders(req) : { 'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}

// Mirror of src/lib/delivery.js — kept in sync manually
const DISTRICTS: Record<string, number> = {
  'Port Louis': 150,
  'Pamplemousses': 150,
  'Rivière du Rempart': 200,
  'Flacq': 200,
  'Grand Port': 200,
  'Savanne': 250,
  'Plaines Wilhems': 150,
  'Moka': 150,
  'Black River': 250,
}
const FREE_DELIVERY_THRESHOLD = 0

function getDeliveryFee(district: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  return DISTRICTS[district] ?? 0
}

const SLOT_LABELS: Record<string, string> = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  any: 'Indifférent',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405, req)

  // Admin client (service role) — bypasses RLS for trusted inserts
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Identify caller (may be anon guest)
  let userId: string | null = null
  let userDiscountPct = 0

  const authHeader = req.headers.get('Authorization')
  if (authHeader) {
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (user) {
      userId = user.id
      const { data: customer } = await supabaseAdmin
        .from('customers')
        .select('discount_pct')
        .eq('id', userId)
        .single()
      userDiscountPct = customer?.discount_pct ?? 0
    }
  }

  let body: {
    items?: { id: string; quantity: number }[]
    form?: {
      name: string; phone: string; email?: string
      district?: string; address?: string; slot?: string; notes?: string
    }
    deliveryMode?: 'delivery' | 'pickup'
    paymentMethod?: 'cod' | 'juice' | 'mips'
  }
  try { body = await req.json() }
  catch { return json({ error: 'Body JSON invalide' }, 400) }

  const { items, form, deliveryMode = 'delivery', paymentMethod = 'cod' } = body

  if (!items?.length) return json({ error: 'Panier vide' }, 400)
  if (!form?.name?.trim()) return json({ error: 'Nom requis' }, 400)
  if (!form?.phone?.trim()) return json({ error: 'Téléphone requis' }, 400)

  // Livraison suspendue globalement (flag app_settings) → rejet serveur, non contournable côté client
  if (deliveryMode === 'delivery') {
    const { data: cfg } = await supabaseAdmin
      .from('app_settings').select('value').eq('key', 'delivery_enabled').single()
    if (cfg?.value !== true) {
      return json({ error: 'Livraison temporairement suspendue — retrait uniquement' }, 403, req)
    }
  }

  if (deliveryMode === 'delivery' && !form?.district) return json({ error: 'District requis' }, 400)
  if (deliveryMode === 'delivery' && !form?.address?.trim()) return json({ error: 'Adresse requise' }, 400)

  // Fetch current prices from DB — this is the trusted source
  const productIds = items.map((i) => i.id)
  const { data: products, error: productsErr } = await supabaseAdmin
    .from('products')
    .select('id, sku, name_fr, price_mur, is_active')
    .in('id', productIds)

  if (productsErr) return json({ error: 'Erreur chargement produits' }, 500)

  // Validate all products exist and are purchasable
  for (const item of items) {
    const product = products?.find((p) => p.id === item.id)
    if (!product) return json({ error: `Produit introuvable: ${item.id}` }, 400)
    if (!product.is_active) return json({ error: `Produit indisponible: ${product.name_fr}` }, 400)
    if (item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) return json({ error: `Quantité invalide pour ${product.name_fr} (max ${MAX_ITEM_QUANTITY})` }, 400, req)
  }

  // Compute totals from trusted DB prices — client-submitted prices are ignored
  let subtotalMur = 0
  const orderItems = []
  for (const item of items) {
    const product = products!.find((p) => p.id === item.id)!
    const lineTotal = Number((product.price_mur * item.quantity).toFixed(2))
    subtotalMur += lineTotal
    orderItems.push({
      product_id: product.id,
      product_sku: product.sku,
      product_name: product.name_fr,
      unit_price_mur: product.price_mur,
      quantity: item.quantity,
      line_total_mur: lineTotal,
    })
  }
  subtotalMur = Number(subtotalMur.toFixed(2))

  const deliveryFee = deliveryMode === 'pickup' ? 0 : getDeliveryFee(form!.district ?? '', subtotalMur)
  const discountMur = userDiscountPct > 0 ? Math.round(subtotalMur * userDiscountPct) / 100 : 0
  const totalMur = Number((subtotalMur + deliveryFee - discountMur).toFixed(2))

  // Build customer_notes (admin-readable summary)
  const slotLabel = SLOT_LABELS[form?.slot ?? 'any'] ?? 'Indifférent'
  const notes = deliveryMode === 'pickup'
    ? [`Nom: ${form!.name}`, `Tél: ${form!.phone}`, `Mode: Retrait sur place`, form?.notes ? `Notes: ${form.notes}` : ''].filter(Boolean).join('\n')
    : [`Nom: ${form!.name}`, `Tél: ${form!.phone}`, `District: ${form!.district}`, `Adresse: ${form!.address}`, `Créneau: ${slotLabel}`, form?.notes ? `Notes: ${form.notes}` : ''].filter(Boolean).join('\n')

  // Payment payload
  const paymentPayload =
    paymentMethod === 'juice'
      ? { payment_method: 'juice', payment_provider: 'manual', payment_status: 'pending' }
      : paymentMethod === 'mips'
      ? { payment_method: 'mips', payment_provider: 'mips', payment_status: 'pending' }
      : { payment_method: 'cod', payment_status: 'pending' }

  // Insert order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: userId,
      guest_phone: form!.phone,
      guest_email: form?.email || null,
      status: 'pending',
      fulfillment_type: deliveryMode,
      ...paymentPayload,
      subtotal_mur: subtotalMur,
      delivery_fee_mur: deliveryFee,
      discount_pct: userDiscountPct,
      discount_mur: discountMur,
      total_mur: totalMur,
      customer_notes: notes,
    })
    .select('id, order_number')
    .single()

  if (orderErr) return json({ error: orderErr.message }, 500)

  // Insert order_items
  const { error: itemsErr } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })))

  if (itemsErr) {
    // Best-effort rollback
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    return json({ error: itemsErr.message }, 500)
  }

  // Upsert customer profile (last-used address) for logged-in users
  if (userId) {
    const coords = {
      full_name: form!.name.trim() || null,
      phone: form!.phone.trim() || null,
      address: deliveryMode === 'delivery' ? (form?.address?.trim() || null) : null,
      district: deliveryMode === 'delivery' ? (form?.district || null) : null,
    }
    const { data: existing } = await supabaseAdmin
      .from('customers').select('id').eq('id', userId).single()
    if (!existing) {
      await supabaseAdmin.from('customers').insert({
        id: userId, email: null, account_type: 'b2c', discount_pct: 0, ...coords,
      })
    } else {
      await supabaseAdmin.from('customers').update(coords).eq('id', userId)
    }
  }

  return json({
    order_id: order.id,
    order_number: order.order_number,
    total_mur: totalMur,
    delivery_fee_mur: deliveryFee,
  })
})
