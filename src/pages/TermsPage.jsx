import { Helmet } from 'react-helmet-async';

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — ProjectVerse</title>
      </Helmet>

      <div className="container-page py-16 max-w-4xl">
        <h1 className="section-heading mb-3">Terms & Conditions</h1>
        <p className="text-sm text-slate-400 mb-8">Effective Date: November 24, 2026</p>

        <div className="card p-8 md:p-10 space-y-6 text-slate-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or submitting content to ProjectVerse, you agree to comply with and be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Acceptable Submissions</h2>
            <p>
              You represent that all project submissions describe genuine software, prototypes, or research innovations. Misleading submissions, malware, malicious links, or copyright-infringing content are strictly prohibited and will be rejected or purged by moderators.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Moderation and Review</h2>
            <p>
              All submissions undergo administrative review before being indexed publicly. ProjectVerse reserves the right to modify categorization or unpublish any listing that violates platform standards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Intellectual Property</h2>
            <p>
              Creators retain full ownership and intellectual property rights in their submitted software and codebases. By listing on ProjectVerse, you grant us permission to display project summaries, logos, and links for indexing.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
