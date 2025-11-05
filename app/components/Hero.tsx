import React from 'react'
import Navbar from './navbar'
import Footer from './footer'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="min-h-screen bg-ligt bg-black-200">
      <Navbar/>
       
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white-900 sm:text-6xl mb-8">
          The most popular </h1>
          <h1  className="text-5xl font-bold tracking-tight text-white-900 sm:text-6xl mb-8">
          free time tracker for teams
        </h1>
        <p className="text-xl text-gray-00 mb-8 max-w-3xl mx-auto">
          Time tracking software used by millions. Tickr is a time tracker and timesheet app that 
          lets you track work hours across projects. Unlimited users, free forever.
        </p>
        <div className="flex items-center justify-center gap-2 mb-8">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-2xl text-yellow-400">★</span>
          ))}
          <span className="text-2xl text-yellow-400">★</span>
          <span className="text-lg text-gray-300 ml-2">5.0 (7,007reviews)</span>
        </div>
        <Link 
          href="/signup" 
          className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          Start tracking time - it&apos;s free! 
        </Link>
      </div>
      <section className="bg-[#f4fafd] py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Start time tracking </h2>
        <h2  className ="text-4xl font-bold text-gray-900 mb-4"> with Tickr</h2>
        <div className="text-lg text-gray-700 mb-8 flex flex-col items-center">
          <span>
            24/7 Support <span className="mx-2">&bull;</span> Cancel Anytime <span className="mx-2">&bull;</span> Free Forever
          </span>
        </div>
        <div className="mb-4">
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
           <h5 className="mx-4"> Create FREE account </h5>
            <h5 className="mx-4"> →</h5>
          </Link>
        </div>
        <div className="flex justify-center items-center text-gray-600 text-base mt-2">
          <span className="mr-2 text-blue-400 text-xl"></span>
        300 people signed up last month
        </div>
      </section>
  
    </div>
    
  );
}
