import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Client avec le JWT de l'appelant pour vérifier son rôle
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile, error: profileErr } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileErr || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Réservé aux admins' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Lecture du body
    const { email, password, full_name, role } = await req.json()

    if (!email || !password || !full_name) {
      return new Response(JSON.stringify({ error: 'Champs manquants : email, password, full_name' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!['admin', 'operator'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Rôle invalide (admin ou operator)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Client admin avec service role key pour créer l'utilisateur
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const uid = created.user?.id
    if (!uid) {
      return new Response(JSON.stringify({ error: 'Utilisateur créé mais ID manquant' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Mise à jour du profil (le trigger on_auth_user_created a déjà créé la ligne)
    const { error: profileUpdateErr } = await supabaseAdmin
      .from('profiles')
      .update({ role, full_name, email })
      .eq('id', uid)

    if (profileUpdateErr) {
      return new Response(JSON.stringify({ error: 'Utilisateur créé mais profil non mis à jour : ' + profileUpdateErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ id: uid, email, role }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
