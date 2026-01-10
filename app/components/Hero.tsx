import React from 'react'
import Link from 'next/link'
import ImageSlider from './ImageSlider'

const landingImages = [
  '/landing-1.png.png',
  '/landing-2.png.png',
  '/landing-3.png.png',
  '/landing-4.png.png',
  '/landing-5.png.png',
  '/landing-6.png.png',
];

export default function Hero() {
  return (
    <>
      {/* Two-column Hero: Timer (left) and Slider (right) */}
      <section className="bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-8 items-center">

            {/* Left: Welcome copy + CTA */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm text-left">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">Welcome to Tickr</h1>
                <p className="text-xl text-gray-600 mb-6">Time tracking made simple</p>

                <div className="flex items-center gap-2 text-emerald-600 mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-2xl">★</span>
                    ))}
                  </div>
                  <span className="text-lg text-gray-600 ml-2">5.0 (7,007 reviews)</span>
                </div>

                <Link
                  href="/signup"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition-colors shadow-lg"
                >
                  Start tracking time - it&apos;s free!
                </Link>
              </div>
            </div>

            {/* Right: Image slider */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
                <div className="relative pt-[56.25%]">
                  <div className="absolute inset-0">
                    <ImageSlider images={landingImages} intervalMs={6000} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Caption below both columns */}
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Start time tracking with <span className="text-emerald-600">Tickr</span></h2>
          </div>

          {/* Added Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Start/Stop</h3>
              <p className="text-gray-600">One-click timers for projects and tasks. No complicated setup required.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Reports</h3>
              <p className="text-gray-600">Generate insightful reports view and look at the performance.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2"> Desktop</h3>
              <p className="text-gray-600">Track time anywhere with our seamless for web.</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-lg text-gray-600 mb-8">
            24/7 Support • Cancel Anytime • Free Forever
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <span className="mr-2">Create FREE account</span>
            <span>→</span>
          </Link>
          <div className="text-gray-500 text-base mt-4">
            300 people signed up last month
          </div>
        </div>
      </section>
    </>
  );
}