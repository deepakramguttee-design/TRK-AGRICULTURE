import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// Lit le niveau d'assurance (aal) depuis le JWT déjà validé par getUser().
// aal2 = l'utilisateur a franchi une étape MFA (TOTP) dans cette session.
function getAal(authHeader: string): string | null {
  try {
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const payload = token.split('.')[1]
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return claims.aal ?? null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  // 1. Vérifier que l'appelant est authentifié
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Non authentifié' }, 401)

  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: userErr } = await supabaseAnon.auth.getUser()
  if (userErr || !user) return json({ error: 'Token invalide' }, 401)

  // 2. Vérifier que l'appelant est admin
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'admin') return json({ error: 'Réservé aux admins' }, 403)

  // 2b. Exiger MFA (aal2) — un mot de passe seul (aal1) ne suffit pas pour cette action sensible
  if (getAal(authHeader) !== 'aal2') {
    return json({ error: 'Authentification à deux facteurs (2FA) requise pour cette action' }, 403)
  }

  // 3. Lire et valider le body
  let body: { user_id?: string }
  try { body = await req.json() } catch { return json({ error: 'Body JSON invalide' }, 400) }

  const user_id = body.user_id
  if (!user_id) return json({ error: 'Champ manquant : user_id' }, 400)
  if (user_id === user.id) return json({ error: 'Impossible de supprimer votre propre compte' }, 400)

  // 4. Interdire la suppression d'un autre admin (le rétrograder d'abord)
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user_id)
    .maybeSingle()

  if (targetProfile?.role === 'admin') {
    return json({ error: 'Impossible de supprimer un admin — rétrogradez-le d\'abord en Employé' }, 400)
  }

  // 5. Détacher les commandes (FK sans cascade) : elles deviennent des commandes "invité"
  const { error: ordersErr } = await supabaseAdmin
    .from('orders')
    .update({ customer_id: null })
    .eq('customer_id', user_id)
  if (ordersErr) return json({ error: 'Détachement des commandes impossible : ' + ordersErr.message }, 500)

  // Détacher aussi les adresses de livraison référencées par des commandes
  const { data: addresses } = await supabaseAdmin
    .from('addresses')
    .select('id')
    .eq('customer_id', user_id)
  const addressIds = (addresses ?? []).map(a => a.id)
  if (addressIds.length > 0) {
    const { error: addrErr } = await supabaseAdmin
      .from('orders')
      .update({ delivery_address_id: null })
      .in('delivery_address_id', addressIds)
    if (addrErr) return json({ error: 'Détachement des adresses impossible : ' + addrErr.message }, 500)
  }

  // 6. Supprimer le profil (pas de cascade depuis auth.users)
  const { error: profileErr } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', user_id)
  if (profileErr) return json({ error: 'Suppression du profil impossible : ' + profileErr.message }, 500)

  // 7. Supprimer l'utilisateur auth → cascade sur customers, addresses, b2b_subscriptions
  const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(user_id)
  if (deleteErr) return json({ error: deleteErr.message }, 500)

  return json({ success: true })
})
