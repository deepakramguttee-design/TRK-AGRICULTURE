import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import i18n from '@/lib/i18n'

const AuthContext = createContext(null)

// customers.preferred_lang ('kr') ↔ codes i18n ('mfe')
const DB_TO_I18N = { fr: 'fr', en: 'en', kr: 'mfe' }

// À la connexion, on applique la langue préférée enregistrée sur la fiche
// client (persistance du choix de langue après reconnexion).
async function applyPreferredLang(userId) {
  const { data } = await supabase
    .from('customers')
    .select('preferred_lang')
    .eq('user_id', userId)
    .single()
  const lang = DB_TO_I18N[data?.preferred_lang]
  if (lang && lang !== i18n.language) {
    i18n.changeLanguage(lang)
    try { localStorage.setItem('trk-lang', lang) } catch { /* stockage indisponible */ }
    document.documentElement.lang = lang
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) await fetchProfile(u.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchProfile(u.id)
        if (event === 'SIGNED_IN') applyPreferredLang(u.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    setProfile(null)
    return supabase.auth.signOut()
  }

  const isAdmin    = profile?.role === 'admin'
  const isEmployee = profile?.role === 'operator' || profile?.role === 'employe'
  const role       = profile?.role ?? null

  return (
    <AuthContext.Provider value={{ user, profile, role, isAdmin, isEmployee, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
