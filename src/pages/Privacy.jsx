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

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#f4f1ea] border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Shield size={13} />
            Data &amp; Privacy
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-zinc-900 mb-4 leading-tight">
            Privacy<br />
            <span className="text-primary">Policy</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            Last updated: June 14, 2026 · TRK Agriculture Limited, Mauritius
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-10">

        <Section icon={Eye} number={1} title="Who We Are">
          <p>
            <strong className="text-zinc-800">TRK AGRICULTURE LIMITED</strong> is a company registered
            in Mauritius, specialising in the cultivation and direct sale of fresh plants —
            spices, salads, leafy greens, vegetables and melons.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              ['Website', 'trk-agriculture.netlify.app'],
              ['Email', 'kailashramguttee@gmail.com'],
              ['Phone', '+230 5774 5304'],
            ].map(([k, v]) => (
              <div key={k} className="bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-100">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-0.5">{k}</p>
                <p className="text-sm font-medium text-zinc-800">{v}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Database} number={2} title="Data We Collect">
          <p className="font-semibold text-zinc-700">When placing an order (Cash on Delivery or Juice):</p>
          <div className="flex flex-wrap pt-1">
            {['First & last name','Phone number','Email address (optional)','Delivery address','District of Mauritius','Preferred delivery slot','Order notes'].map(d => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>
          <p className="font-semibold text-zinc-700 mt-2">When submitting a B2B quote request:</p>
          <div className="flex flex-wrap pt-1">
            {['Company name & type','Contact name','Professional email & phone','Estimated monthly volume','Varieties of interest'].map(d => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>
          <p className="font-semibold text-zinc-700 mt-2">Technical data (collected automatically):</p>
          <div className="flex flex-wrap pt-1">
            {['IP address (logs, 30 days)','Browser type & device','Session cookies (cart)'].map(d => (
              <Tag key={d}>{d}</Tag>
            ))}
          </div>
        </Section>

        <Section icon={Eye} number={3} title="Why We Collect This Data">
          <ul className="space-y-2">
            {[
              'To process and deliver your orders',
              'To contact you to confirm or adjust a delivery',
              'To respond to B2B quote requests',
              'To improve the service (anonymised analysis)',
            ].map(r => (
              <li key={r} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <NegBox>
            <p className="font-semibold text-zinc-700 mb-2">We do NOT use your data for:</p>
            <ul className="space-y-1">
              {['Targeted advertising','Selling to third parties','Unsolicited newsletters'].map(r => (
                <li key={r} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </NegBox>
        </Section>

        <Section icon={Database} number={4} title="Where Your Data Is Stored">
          <p>
            Your data is hosted by <strong className="text-zinc-800">Supabase</strong>, on servers
            located in Singapore (region <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">ap-southeast-1</code>).
            Supabase is <strong className="text-zinc-800">SOC 2 Type II</strong> compliant.
          </p>
        </Section>

        <Section icon={UserCheck} number={5} title="Who We Share Your Data With">
          <ul className="space-y-2">
            {[
              'The TRK Agriculture team to process your order',
              'Our hosting provider (Supabase) for storage',
              'The future payment provider (MIPS, for card payments upon integration)',
            ].map(r => (
              <li key={r} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 font-medium text-sm mt-2">
            We <strong>never</strong> sell your data to third parties.
          </div>
        </Section>

        <Section icon={Clock} number={6} title="Retention Period">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Order data','5 years','Mauritian accounting & tax obligations'],
              ['Unconverted B2B quotes','2 years','Commercial prospecting'],
              ['Server logs','30 days','Security & debugging'],
              ['Admin account','Account lifetime','Functional access'],
            ].map(([label, duration, reason]) => (
              <div key={label} className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 text-sm">{label}</p>
                <p className="text-primary font-bold text-lg mt-1">{duration}</p>
                <p className="text-xs text-zinc-400 mt-1">{reason}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={UserCheck} number={7} title="Your Rights">
          <p>
            In accordance with the <strong className="text-zinc-800">Mauritius Data Protection Act 2017</strong> and the GDPR:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {[
              ['Right of access','Request a copy of your data'],
              ['Right to rectification','Correct inaccurate information'],
              ['Right to erasure','Request deletion (except legal obligations)'],
              ['Right to portability','Receive your data in a structured format'],
            ].map(([right, desc]) => (
              <div key={right} className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 text-sm">{right}</p>
                <p className="text-zinc-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3">
            To exercise these rights:{' '}
            <a href="mailto:kailashramguttee@gmail.com" className="text-primary hover:underline font-medium">
              kailashramguttee@gmail.com
            </a>
          </p>
        </Section>

        <Section icon={Lock} number={8} title="Cookies">
          <p>
            We use only cookies <strong className="text-zinc-800">essential</strong> to the
            site's operation (shopping cart, admin login session).
            No advertising or tracking cookies are used.
          </p>
        </Section>

        <Section icon={Shield} number={9} title="Security">
          <p>
            All communications are encrypted (<strong className="text-zinc-800">HTTPS</strong>).
            Admin access is protected by password and{' '}
            <strong className="text-zinc-800">RLS</strong> (Row Level Security) policies
            at the database level.
          </p>
        </Section>

        <Section icon={Eye} number={10} title="Minors">
          <p>
            Our service is intended for adults (18+). We do not knowingly collect data
            relating to minors.
          </p>
        </Section>

        <Section icon={Clock} number={11} title="Changes">
          <p>
            This policy may be updated. Any changes will be published on this page
            with a new last-updated date.
          </p>
        </Section>

        {/* Contact CTA */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-white rounded-full border border-green-200 flex items-center justify-center mx-auto mb-4 text-primary">
            <Mail size={22} />
          </div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-2">Any questions?</h2>
          <p className="text-zinc-600 text-sm mb-5">
            For any questions about your data or this privacy policy.
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
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
