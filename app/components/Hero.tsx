import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <>
      {/* Hero Section  just content */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-center">  
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              Welcome to Tickr
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
              Time tracking made simple
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-600"> 
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">★</span>
            ))}
            <span className="text-lg text-gray-600 ml-2">5.0 (7,007 reviews)</span>
          </div>
          <Link 
            href="/signup" 
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-emerald-500 rounded-md hover:bg-emerald-600 transition-colors shadow-lg"
          >
            Start tracking time - it's free! 
          </Link>
        </div>
      </section>

      {/* CTA Section - Also white, no black */}
      <section className="bg-white py-16 border-t border-gray-200 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start time tracking with Tickr
          </h2>
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