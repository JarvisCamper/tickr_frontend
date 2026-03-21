export default function AdminPrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <section className="admin-panel rounded-3xl p-6 md:p-8">
        <div className="max-w-4xl">
          <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav className="space-y-3 text-sm">
              <a href="#overview" className="block text-cyan-700 hover:text-cyan-800">Overview</a>
              <a href="#data" className="block text-cyan-700 hover:text-cyan-800">Information We Collect</a>
              <a href="#use" className="block text-cyan-700 hover:text-cyan-800">How We Use Data</a>
              <a href="#security" className="block text-cyan-700 hover:text-cyan-800">Security</a>
              <a href="#rights" className="block text-cyan-700 hover:text-cyan-800">Your Rights</a>
            </nav>

            <div className="space-y-8 text-slate-700">
              <section id="overview">
                <h2 className="text-2xl font-semibold text-slate-950">Overview</h2>
                <p className="mt-3 leading-7">
                  Tickr collects operational and account data to support time tracking, reporting, and monitored work sessions.
                  This policy explains what we collect, why we collect it, and how administrators should handle that data responsibly.
                </p>
              </section>

              <section id="data">
                <h2 className="text-2xl font-semibold text-slate-950">Information We Collect</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
                  <li>Account details such as name, email, and workspace identity</li>
                  <li>Time logs, project associations, and task descriptions</li>
                  <li>Screenshots while timer tracking is active, when monitoring is enabled</li>
                  <li>Device, browser, and IP information used for access and audit trails</li>
                </ul>
              </section>

              <section id="use">
                <h2 className="text-2xl font-semibold text-slate-950">How We Use Data</h2>
                <p className="mt-3 leading-7">
                  Data is used to support time tracking, team operations, analytics, reporting, and security review workflows.
                  Tickr does not sell personal data to third parties.
                </p>
              </section>

              <section id="security">
                <h2 className="text-2xl font-semibold text-slate-950">Data Security</h2>
                <p className="mt-3 leading-7">
                  Tickr applies transport and storage protections and limits access to authorized personnel. Admins should only
                  review monitored data for legitimate operational or compliance reasons.
                </p>
              </section>

              <section id="rights">
                <h2 className="text-2xl font-semibold text-slate-950">Your Rights</h2>
                <p className="mt-3 leading-7">
                  Users may request deletion or export of their data in accordance with platform policy and applicable law.
                  Contact <a href="mailto:privacy@tickrapp.com" className="text-cyan-700 hover:text-cyan-800">privacy@tickrapp.com</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
