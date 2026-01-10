"use client";

import Link from "next/link";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: "⏱️",
    title: "Real-time Tracking",
    description: "Track your time accurately with our intuitive timer. Start, stop, and manage your time entries seamlessly.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description: "Create teams, invite members, and collaborate on projects. Assign tasks and track team progress effortlessly.",
  },
  {
    icon: "📊",
    title: "Detailed Reports",
    description: "Generate comprehensive reports on time spent, project progress, and team productivity. Gain insights into your workflow.",
  },
  {
    icon: "📁",
    title: "Project Management",
    description: "Organize your projects, set deadlines, and monitor progress. Keep everything organized in one place.",
  },
];

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white text-lg">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Features</h1>
        <p className="mt-2 text-gray-600">Everything you need to streamline your workflow</p>
      </div>
    </header>
  );
}

function FeaturesGrid() {
  return (
    <section id="features" className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Why choose Tickr?</h2>
      <p className="text-gray-600 mb-8">Streamline your time tracking and project management</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <div className="mt-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
      <Link
        href="/signup"
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-md transition-colors"
      >
        Sign up now
      </Link>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <FeaturesGrid />
          <CTA />
        </div>
      </main>
    </div>
  );
}
