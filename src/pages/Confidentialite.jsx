import { Link } from 'react-router-dom'

export default function Confidentialite() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-3xl font-bold text-primary mb-1">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Dernière mise à jour : 10 juin 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Qui sommes-nous</h2>
          <p>
            TRK AGRICULTURE LIMITED est une entreprise enregistrée à Maurice spécialisée
            dans la culture et la vente de plants frais (épices, salades, brèdes, légumes,
            melons).
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><span className="font-medium">Site web :</span> https://trk-agriculture.netlify.app</li>
            <li><span className="font-medium">Email contact :</span> deepak.ramguttee@gmail.com</li>
            <li><span className="font-medium">Téléphone :</span> [à compléter]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Données que nous collectons</h2>

          <p className="font-medium mt-4 mb-2">Lors d'une commande (Cash on Delivery) :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nom et prénom</li>
            <li>Numéro de téléphone (pour la livraison)</li>
            <li>Adresse email (optionnel)</li>
            <li>Adresse de livraison</li>
            <li>District de Maurice</li>
            <li>Créneau de livraison souhaité</li>
            <li>Notes éventuelles</li>
          </ul>

          <p className="font-medium mt-4 mb-2">Lors d'une demande de devis B2B :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nom de l'entreprise et type (hôtel, restaurant, etc.)</li>
            <li>Nom du contact</li>
            <li>Email et téléphone professionnels</li>
            <li>Volume mensuel estimé</li>
            <li>Variétés intéressées</li>
          </ul>

          <p className="font-medium mt-4 mb-2">Données techniques collectées automatiquement :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Adresse IP (logs serveur, conservés 30 jours)</li>
            <li>Type de navigateur et appareil</li>
            <li>Cookies de session (panier d'achat)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Pourquoi nous collectons ces données</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Traiter et livrer vos commandes</li>
            <li>Vous contacter pour confirmer ou ajuster une livraison</li>
            <li>Répondre à vos demandes de devis B2B</li>
            <li>Améliorer le service (analyse anonymisée)</li>
          </ul>
          <p className="mt-4 font-medium">Nous n'utilisons PAS vos données pour :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>De la publicité ciblée</li>
            <li>De la vente à des tiers</li>
            <li>Des newsletters non sollicitées</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Où vos données sont stockées</h2>
          <p>
            Vos données sont hébergées chez Supabase, sur des serveurs situés à Singapour
            (région ap-southeast-1). Supabase est conforme SOC 2 Type II.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Avec qui nous partageons vos données</h2>
          <p>Vos données sont accessibles uniquement à :</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>L'équipe TRK Agriculture pour traiter votre commande</li>
            <li>Notre prestataire d'hébergement (Supabase) pour le stockage</li>
            <li>
              Le futur prestataire de paiement (lors de l'intégration MIPS, pour les
              paiements par carte)
            </li>
          </ul>
          <p className="mt-3 font-medium">Nous ne vendons JAMAIS vos données à des tiers.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Durée de conservation</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Données de commande : 5 ans (obligation comptable et fiscale mauricienne)</li>
            <li>Données de devis B2B non transformé : 2 ans</li>
            <li>Logs serveur : 30 jours</li>
            <li>Données de compte admin : tant que le compte est actif</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Vos droits</h2>
          <p>
            Conformément à la Mauritius Data Protection Act 2017 et au RGPD :
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <span className="font-medium">Droit d'accès :</span> vous pouvez demander une
              copie de vos données
            </li>
            <li>
              <span className="font-medium">Droit de rectification :</span> corriger des
              informations inexactes
            </li>
            <li>
              <span className="font-medium">Droit à l'effacement :</span> demander la suppression
              (sauf obligations légales)
            </li>
            <li>
              <span className="font-medium">Droit à la portabilité :</span> recevoir vos données
              dans un format structuré
            </li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à :{' '}
            <a href="mailto:deepak.ramguttee@gmail.com" className="text-primary hover:underline">
              deepak.ramguttee@gmail.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
          <p>
            Nous utilisons uniquement des cookies essentiels au fonctionnement du site
            (panier d'achat, session de connexion admin). Aucun cookie publicitaire ou de
            tracking n'est utilisé.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Sécurité</h2>
          <p>
            Toutes les communications avec le site sont chiffrées (HTTPS). Les accès admin
            sont protégés par mot de passe et politiques RLS (Row Level Security) au niveau
            de la base de données.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Mineurs</h2>
          <p>
            Notre service est destiné aux adultes (18 ans+). Nous ne collectons pas
            sciemment de données concernant des mineurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Modifications</h2>
          <p>
            Cette politique peut être mise à jour. Toute modification sera publiée sur
            cette page avec une nouvelle date de mise à jour.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p>Pour toute question concernant cette politique :</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <span className="font-medium">Email :</span>{' '}
              <a href="mailto:deepak.ramguttee@gmail.com" className="text-primary hover:underline">
                deepak.ramguttee@gmail.com
              </a>
            </li>
            <li><span className="font-medium">Téléphone :</span> [à compléter]</li>
            <li><span className="font-medium">Adresse :</span> [adresse mauricienne de TRK]</li>
          </ul>
        </section>
      </article>

      <div className="mt-10 pt-6 border-t">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
