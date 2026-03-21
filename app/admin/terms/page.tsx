export default function AdminTermsPage() {
  return (
    <div className="space-y-6">
      <section className="admin-panel rounded-3xl p-6 md:p-8">
        <div className="max-w-4xl space-y-8 text-slate-700">
          <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Acceptance</h2>
            <p className="mt-3 leading-7">
              By accessing or using Tickr, users and administrators agree to follow the product terms, monitoring rules,
              and workspace governance set by the organization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Use of Service</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
              <li>Use the service only for authorized and lawful work-related purposes.</li>
              <li>Do not tamper with logs, screenshots, timers, or audit records.</li>
              <li>Screenshots and activity data may be collected while timer tracking is active.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Screenshot Monitoring</h2>
            <p className="mt-3 leading-7">
              Tickr may capture periodic screenshots during tracked work sessions where the organization enables monitoring.
              Organizations are responsible for informing employees and using monitoring features in compliance with local law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Administrator Responsibility</h2>
            <p className="mt-3 leading-7">
              Administrators must use access to logs, reports, screenshots, and account data responsibly and only for legitimate
              operational, security, or compliance needs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Limitations</h2>
            <p className="mt-3 leading-7">
              Tickr is provided on an &quot;as is&quot; basis, and uninterrupted availability is not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Contact</h2>
            <p className="mt-3 leading-7">
              For legal inquiries, contact <a href="mailto:legal@tickrapp.com" className="text-cyan-700 hover:text-cyan-800">legal@tickrapp.com</a>.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
