import { Link } from 'react-router-dom'
import { Shield, Database, Eye, Clock, UserCheck, Lock, Mail } from 'lucide-react'

const Section = ({ icon: Icon, number, title, children }) => (
  <div className="group relative">
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-primary mt-0.5 group-hover:bg-green-100 transition-colors">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-display text-xl font-bold text-zinc-900 mb-4 flex items-baseline gap-2">
          <span className="text-primary/40 text-sm font-sans font-semibold tabular-nums">{String(number).padStart(2,'0')}</span>
          {title}
        </h2>
        <div className="text-sm text-zinc-600 leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
    <div className="mt-8 border-b border-zinc-100" />
  </div>
)

const Tag = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-200 mr-1.5 mb-1.5">
    {children}
  </span>
)

const NegBox = ({ children }) => (
  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm text-zinc-600">
    {children}
  </div>
)

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#f4f1ea] border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Shield size={13} />
            Données &amp; Vie privée
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-zinc-900 mb-4 leading-tight">
            Politique de<br />
            <span className="text-primary">Confidentialité</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            Dernière mise à jour : 14 juin 2026 · TRK Agriculture Limited, Maurice
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-10">

        <Section icon={Eye} number={1} title="Qui sommes-nous">
          <p>
            <strong className="text-zinc-800">TRK AGRICULTURE LIMITED</strong> est une entreprise enregistrée à Maurice,
            spécialisée dans la culture et la vente directe de plants frais — épices, salades,
            brèdes, légumes et melons.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              ['Site web', 'trk-agriculture.netlify.app'],
              ['Email', 'kailashramguttee@gmail.com'],
            ].map(([k, v]) => (
              <div key={k} className="bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-100">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-0.5">{k}</p>
                <p className="text-sm font-medium text-zinc-800">{v}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Database} number={2} title="Données que nous collectons">
          <p className="font-semibold text-zinc-700">Lors d'une commande (Cash on Delivery ou Juice) :</p>
          <div className="flex flex-wrap pt-1">
            {['Nom et prénom','Numéro de téléphone','Adresse email (optionnel)','Adresse de livraison','District de Maurice','Créneau de livraison souhaité','Notes éventuelles'].map(d => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>
          <p className="font-semibold text-zinc-700 mt-2">Lors d'une demande de devis B2B :</p>
          <div className="flex flex-wrap pt-1">
            {["Nom de l'entreprise et type","Nom du contact","Email et téléphone professionnels","Volume mensuel estimé","Variétés intéressées"].map(d => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>
          <p className="font-semibold text-zinc-700 mt-2">Données techniques (collectées automatiquement) :</p>
          <div className="flex flex-wrap pt-1">
            {['Adresse IP (logs 30 jours)','Type de navigateur','Cookies de session (panier)'].map(d => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>
        </Section>

        <Section icon={Eye} number={3} title="Pourquoi nous collectons ces données">
          <ul className="space-y-2">
            {[
              'Traiter et livrer vos commandes',
              'Vous contacter pour confirmer ou ajuster une livraison',
              'Répondre à vos demandes de devis B2B',
              'Améliorer le service (analyse anonymisée)',
            ].map(r => (
              <li key={r} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <NegBox>
            <p className="font-semibold text-zinc-700 mb-2">Nous n'utilisons PAS vos données pour :</p>
            <ul className="space-y-1">
              {['De la publicité ciblée','La vente à des tiers','Des newsletters non sollicitées'].map(r => (
                <li key={r} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </NegBox>
        </Section>

        <Section icon={Database} number={4} title="Où vos données sont stockées">
          <p>
            Vos données sont hébergées chez <strong className="text-zinc-800">Supabase</strong>, sur des serveurs
            situés à Singapour (région <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">ap-southeast-1</code>).
            Supabase est conforme <strong className="text-zinc-800">SOC 2 Type II</strong>.
          </p>
        </Section>

        <Section icon={UserCheck} number={5} title="Avec qui nous partageons vos données">
          <ul className="space-y-2">
            {[
              "L'équipe TRK Agriculture pour traiter votre commande",
              'Notre prestataire d\'hébergement (Supabase) pour le stockage',
              'Le prestataire de paiement (MIPS, lors de l\'intégration future)',
            ].map(r => (
              <li key={r} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 font-medium text-sm mt-2">
            Nous ne vendons <strong>jamais</strong> vos données à des tiers.
          </div>
        </Section>

        <Section icon={Clock} number={6} title="Durée de conservation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Données de commande','5 ans','Obligation comptable et fiscale mauricienne'],
              ['Devis B2B non transformé','2 ans','Prospection commerciale'],
              ['Logs serveur','30 jours','Sécurité et débogage'],
              ['Compte admin','Durée du compte','Accès fonctionnel'],
            ].map(([label, duration, reason]) => (
              <div key={label} className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 text-sm">{label}</p>
                <p className="text-primary font-bold text-lg mt-1">{duration}</p>
                <p className="text-xs text-zinc-400 mt-1">{reason}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={UserCheck} number={7} title="Vos droits">
          <p>
            Conformément à la <strong className="text-zinc-800">Mauritius Data Protection Act 2017</strong> et au RGPD :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {[
              ['Droit d\'accès','Demander une copie de vos données'],
              ['Droit de rectification','Corriger des informations inexactes'],
              ['Droit à l\'effacement','Demander la suppression (sauf obligations légales)'],
              ['Droit à la portabilité','Recevoir vos données dans un format structuré'],
            ].map(([right, desc]) => (
              <div key={right} className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 text-sm">{right}</p>
                <p className="text-zinc-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3">
            Pour exercer ces droits :{' '}
            <a href="mailto:kailashramguttee@gmail.com" className="text-primary hover:underline font-medium">
              kailashramguttee@gmail.com
            </a>
          </p>
        </Section>

        <Section icon={Lock} number={8} title="Cookies">
          <p>
            Nous utilisons uniquement des cookies <strong className="text-zinc-800">essentiels</strong> au
            fonctionnement du site (panier d'achat, session de connexion admin).
            Aucun cookie publicitaire ou de tracking n'est utilisé.
          </p>
        </Section>

        <Section icon={Shield} number={9} title="Sécurité">
          <p>
            Toutes les communications sont chiffrées (<strong className="text-zinc-800">HTTPS</strong>).
            Les accès admin sont protégés par mot de passe et politiques{' '}
            <strong className="text-zinc-800">RLS</strong> (Row Level Security) au niveau de la base de données.
          </p>
        </Section>

        <Section icon={Eye} number={10} title="Mineurs">
          <p>
            Notre service est destiné aux adultes (18 ans+). Nous ne collectons pas
            sciemment de données concernant des mineurs.
          </p>
        </Section>

        <Section icon={Clock} number={11} title="Modifications">
          <p>
            Cette politique peut être mise à jour. Toute modification sera publiée sur
            cette page avec une nouvelle date de mise à jour.
          </p>
        </Section>

        {/* Contact CTA */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full border border-green-200 flex items-center justify-center mx-auto mb-4 text-primary">
            <Mail size={22} />
          </div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-2">Des questions ?</h2>
          <p className="text-zinc-600 text-sm mb-5">
            Pour toute question concernant vos données ou cette politique de confidentialité.
          </p>
          <a
            href="mailto:kailashramguttee@gmail.com"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            <Mail size={15} />
            kailashramguttee@gmail.com
          </a>
        </div>

        <div className="pt-2">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
