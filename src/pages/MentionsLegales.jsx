import { Link } from 'react-router-dom'

export default function MentionsLegales() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-3xl font-bold text-primary mb-1">Mentions légales</h1>
        <p className="text-muted-foreground mt-4">
          Mentions légales en cours de rédaction. Contactez-nous à{' '}
          <a href="mailto:deepak.ramguttee@gmail.com" className="text-primary hover:underline">
            deepak.ramguttee@gmail.com
          </a>{' '}
          pour toute question.
        </p>
      </article>

      <div className="mt-10 pt-6 border-t">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
