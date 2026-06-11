import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-3xl font-bold text-primary mb-1">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: June 10, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
          <p>
            TRK AGRICULTURE LIMITED is a company registered in Mauritius specialising in
            the cultivation and sale of fresh plants (spices, salads, leafy greens,
            vegetables, melons).
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><span className="font-medium">Website:</span> https://trk-agriculture.netlify.app</li>
            <li><span className="font-medium">Contact email:</span> deepak.ramguttee@gmail.com</li>
            <li><span className="font-medium">Phone:</span> [to be completed]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>

          <p className="font-medium mt-4 mb-2">When placing an order (Cash on Delivery):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>First and last name</li>
            <li>Phone number (for delivery)</li>
            <li>Email address (optional)</li>
            <li>Delivery address</li>
            <li>District of Mauritius</li>
            <li>Preferred delivery slot</li>
            <li>Any notes</li>
          </ul>

          <p className="font-medium mt-4 mb-2">When submitting a B2B quote request:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Company name and type (hotel, restaurant, etc.)</li>
            <li>Contact name</li>
            <li>Professional email and phone</li>
            <li>Estimated monthly volume</li>
            <li>Varieties of interest</li>
          </ul>

          <p className="font-medium mt-4 mb-2">Technical data collected automatically:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address (server logs, retained for 30 days)</li>
            <li>Browser type and device</li>
            <li>Session cookies (shopping cart)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Why We Collect This Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and deliver your orders</li>
            <li>To contact you to confirm or adjust a delivery</li>
            <li>To respond to B2B quote requests</li>
            <li>To improve the service (anonymised analysis)</li>
          </ul>
          <p className="mt-4 font-medium">We do NOT use your data for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Targeted advertising</li>
            <li>Selling to third parties</li>
            <li>Unsolicited newsletters</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Where Your Data Is Stored</h2>
          <p>
            Your data is hosted by Supabase, on servers located in Singapore
            (ap-southeast-1 region). Supabase is SOC 2 Type II compliant.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Who We Share Your Data With</h2>
          <p>Your data is accessible only to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>The TRK Agriculture team to process your order</li>
            <li>Our hosting provider (Supabase) for storage</li>
            <li>
              The future payment provider (upon MIPS integration, for card payments)
            </li>
          </ul>
          <p className="mt-3 font-medium">We NEVER sell your data to third parties.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Retention Period</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Order data: 5 years (Mauritian accounting and tax obligations)</li>
            <li>B2B quote data (unconverted): 2 years</li>
            <li>Server logs: 30 days</li>
            <li>Admin account data: for as long as the account is active</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p>
            In accordance with the Mauritius Data Protection Act 2017 and the GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <span className="font-medium">Right of access:</span> you may request a copy
              of your data
            </li>
            <li>
              <span className="font-medium">Right to rectification:</span> correct inaccurate
              information
            </li>
            <li>
              <span className="font-medium">Right to erasure:</span> request deletion (except
              where legally required)
            </li>
            <li>
              <span className="font-medium">Right to portability:</span> receive your data in
              a structured format
            </li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at:{' '}
            <a href="mailto:deepak.ramguttee@gmail.com" className="text-primary hover:underline">
              deepak.ramguttee@gmail.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
          <p>
            We use only cookies that are essential for the site to function (shopping cart,
            admin login session). No advertising or tracking cookies are used.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Security</h2>
          <p>
            All communications with the site are encrypted (HTTPS). Admin access is
            protected by password and RLS (Row Level Security) policies at the database level.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Minors</h2>
          <p>
            Our service is intended for adults (18+). We do not knowingly collect data
            relating to minors.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Changes</h2>
          <p>
            This policy may be updated. Any changes will be published on this page with a
            new last-updated date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p>For any questions regarding this policy:</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <span className="font-medium">Email:</span>{' '}
              <a href="mailto:deepak.ramguttee@gmail.com" className="text-primary hover:underline">
                deepak.ramguttee@gmail.com
              </a>
            </li>
            <li><span className="font-medium">Phone:</span> [to be completed]</li>
            <li><span className="font-medium">Address:</span> [TRK Mauritian address]</li>
          </ul>
        </section>
      </article>

      <div className="mt-10 pt-6 border-t">
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
