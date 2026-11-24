import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — ProjectVerse</title>
      </Helmet>

      <div className="container-page py-16 max-w-4xl">
        <h1 className="section-heading mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Effective Date: November 24, 2026</p>

        <div className="card p-8 md:p-10 space-y-6 text-slate-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              ProjectVerse ("we", "us", or "our") respects your privacy. This Privacy Policy describes how we collect, store, and utilize information when you explore solutions or publish innovations through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Information Collected</h2>
            <p className="mb-2">We collect information provided directly by you when creating an account or submitting a project:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account credentials (email, display name).</li>
              <li>Public creator profiles (bio, affiliated organization, technical skills).</li>
              <li>Submitted project metadata (titles, problem statements, solutions, repository and live URLs).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. How Information is Used</h2>
            <p>
              Project information is published publicly to enable problem-to-solution discovery. Personal email addresses and private authentication tokens are never sold, rented, or exposed to third parties without consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Security</h2>
            <p>
              We enforce role-based access rules and secure storage via Firebase Authentication and Cloud Firestore rules to protect user records against unauthorized modification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Contact</h2>
            <p>
              For privacy requests or account data deletion, please contact privacy@projectverse.dev.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
