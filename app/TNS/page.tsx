export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">Terms of Service</h1>
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
          </header>

          <div className="space-y-6 prose prose-sm">
            <section>
              <h2 className="text-xl font-semibold">Acceptance</h2>
              <p>By accessing or using Tickr, you agree to be bound by these Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Use of Service</h2>
              <ul className="list-disc pl-6">
                <li>Use the service only for lawful and authorized purposes.</li>
                <li>Do not attempt to bypass monitoring or tamper with data.</li>
                <li>Screenshots and activity data are collected while timer is active.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Screenshot Monitoring</h2>
              <p>Tickr may capture periodic screenshots while time tracking is active. Use of the platform indicates consent to such monitoring.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Employer Responsibility</h2>
              <p>Employers should inform employees about monitoring and ensure compliance with local laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Limitations</h2>
              <p>We provide the service "as is" and do not guarantee uninterrupted operation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Contact</h2>
              <p>For legal inquiries, email <a href="mailto:legal@tickrapp.com" className="text-blue-600">legal@tickrapp.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
