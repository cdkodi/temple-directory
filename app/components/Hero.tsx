'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="gradient-hero text-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Sacred Spaces
            <br />
            <span className="text-yellow-200">Across America</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Find Hindu temples, Sikh gurdwaras, and Jain temples near you. 
            Explore spiritual centers, cultural programs, and community events.
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search temples, cities, or traditions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                />
              </div>
              <Link 
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-4 px-8 rounded-lg transition-colors duration-200"
              >
                Search
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/temples" className="btn-secondary">
              Browse All Temples
            </Link>
            <Link href="/traditions/hindu" className="btn-secondary">
              Hindu Temples
            </Link>
            <Link href="/traditions/sikh" className="btn-secondary">
              Sikh Gurdwaras
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">800+</div>
              <div className="text-lg opacity-90">Temples Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-lg opacity-90">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-lg opacity-90">Monthly Visits</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
