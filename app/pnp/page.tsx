export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </header>

          <div className="grid md:grid-cols-3 gap-6">
            <nav className="space-y-3 md:col-span-1">
              <a href="#overview" className="block text-sm text-blue-600 hover:underline">Overview</a>
              <a href="#data" className="block text-sm text-blue-600 hover:underline">Information We Collect</a>
              <a href="#use" className="block text-sm text-blue-600 hover:underline">How We Use Data</a>
              <a href="#security" className="block text-sm text-blue-600 hover:underline">Security</a>
              <a href="#rights" className="block text-sm text-blue-600 hover:underline">Your Rights</a>
            </nav>

            <div className="md:col-span-2 space-y-6 prose prose-sm">
              <section id="overview">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p>Welcome to Tickr. This policy explains what data we collect, why we collect it, and how you can control it.</p>
              </section>

              <section id="data">
                <h2 className="text-xl font-semibold">Information We Collect</h2>
                <ul className="list-disc pl-6">
                  <li>Account details (name, email)</li>
                  <li>Time logs and related activity</li>
                  <li>Screenshots while timer is active</li>
                  <li>Device, browser and IP information</li>
                </ul>
              </section>

              <section id="use">
                <h2 className="text-xl font-semibold">How We Use Your Information</h2>
                <p>We use data to provide time tracking, analytics, and support. We do not sell your personal data.</p>
              </section>

              <section id="security">
                <h2 className="text-xl font-semibold">Data Security</h2>
                <p>We use encryption in transit and at rest, and limit access to authorized personnel only.</p>
              </section>

              <section id="rights">
                <h2 className="text-xl font-semibold">Your Rights</h2>
                <p>You may request deletion or export of your data. Contact us at <a href="mailto:privacy@tickrapp.com" className="text-blue-600">privacy@tickrapp.com</a>.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
