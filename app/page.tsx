// app/page.tsx - For App Router
'use client'

import React, { useState, useEffect } from 'react'
import { Search, MapPin, Users, Calendar, Star, ArrowRight } from 'lucide-react'

interface Temple {
  id: string
  name: string
  city: string
  state_name: string
  tradition_name: string
  google_rating: number | null
  google_reviews_count: number | null
  primary_image_url: string | null
  slug: string
}

interface Tradition {
  id: string
  name: string
  color_code: string
  temple_count: number
}

export default function HomePage() {
  const [featuredTemples, setFeaturedTemples] = useState<Temple[]>([])
  const [traditions, setTraditions] = useState<Tradition[]>([])
  const [stats, setStats] = useState({
    totalTemples: 0,
    totalStates: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTradition, setSelectedTradition] = useState('')

  useEffect(() => {
    loadHomePageData()
  }, [])

  const loadHomePageData = async () => {
    try {
      // Load featured temples
      const templesResponse = await fetch('/api/homepage/featured-temples')
      if (templesResponse.ok) {
        const templesData = await templesResponse.json()
        setFeaturedTemples(templesData.temples)
      }

      // Load traditions with counts
      const traditionsResponse = await fetch('/api/homepage/traditions')
      if (traditionsResponse.ok) {
        const traditionsData = await traditionsResponse.json()
        setTraditions(traditionsData.traditions)
      }

      // Load stats
      const statsResponse = await fetch('/api/homepage/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

    } catch (error) {
      console.error('Error loading homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery)
      if (selectedTradition) params.set('tradition', selectedTradition)
      window.location.href = `/search?${params.toString()}`
    }
  }

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          window.location.href = `/search?lat=${latitude}&lng=${longitude}&radius=25`
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please try searching by city or temple name.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  // Helper function to get tradition colors
  const getTraditionColor = (traditionName: string): string => {
    const colors: { [key: string]: string } = {
      'Hindu': '#FF6B35',
      'Sikh': '#FF8500', 
      'Jain': '#FFB000',
      'Buddhist': '#FFA500'
    }
    return colors[traditionName] || '#FF6B35'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-amber-600/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Sacred Spaces
              <span className="block bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Across America
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Find Hindu, Sikh, and Jain temples near you. Connect with your spiritual community, 
              discover festivals, and explore the rich traditions that unite us.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search temples, cities, or deities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:outline-none focus:ring-0"
                  />
                </div>

                <select
                  value={selectedTradition}
                  onChange={(e) => setSelectedTradition(e.target.value)}
                  className="px-4 py-4 border-0 rounded-xl focus:outline-none focus:ring-0 text-gray-700 bg-gray-50 md:w-48"
                >
                  <option value="">All Traditions</option>
                  {traditions.map((tradition) => (
                    <option key={tradition.id} value={tradition.name}>
                      {tradition.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </form>

            {/* Location Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleLocationSearch}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Find temples near me
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                value: loading ? '...' : `${stats.totalTemples}+`,
                label: 'Temples Listed',
                description: 'Sacred spaces across all traditions'
              },
              {
                icon: MapPin,
                value: loading ? '...' : `${stats.totalStates}`,
                label: 'States Covered',
                description: 'Coast to coast temple directory'
              },
              {
                icon: Calendar,
                value: '100+',
                label: 'Festivals Celebrated',
                description: 'Annual spiritual celebrations'
              },
              {
                icon: Star,
                value: loading ? '...' : stats.avgRating.toFixed(1),
                label: 'Average Rating',
                description: 'Community-verified temples'
              }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-6 shadow-md">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">{stat.value}</div>
                <div className="text-xl font-semibold mb-1 text-gray-700">{stat.label}</div>
                <div className="text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traditions Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Spiritual Traditions
            </h2>
            <p className="text-xl text-gray-600">
              Explore temples from diverse spiritual traditions across America
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md animate-pulse">
                  <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {traditions.map((tradition) => (
                <a
                  key={tradition.id}
                  href={`/search?tradition=${tradition.name}`}
                  className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div 
                    className="w-12 h-12 rounded-full mb-4 flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: tradition.color_code }}
                  >
                    {tradition.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {tradition.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {tradition.temple_count} temples across America
                  </p>
                  <div className="flex items-center text-orange-600 font-medium">
                    <span>Explore temples</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Temples */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Temples
            </h2>
            <p className="text-xl text-gray-600">
              Discover some of the most celebrated temples in our community
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTemples.map((temple) => (
                <a
                  key={temple.id}
                  href={`/temples/${temple.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={temple.primary_image_url || '/temple-placeholder.jpg'}
                      alt={temple.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div 
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: getTraditionColor(temple.tradition_name) }}
                    >
                      {temple.tradition_name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {temple.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{temple.city}, {temple.state_name}</span>
                    </div>
                    {temple.google_rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {temple.google_rating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({temple.google_reviews_count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="/temples"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition-all duration-200"
            >
              View All Temples
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Can't Find Your Temple?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Help us build the most comprehensive temple directory in America. 
            Submit your temple for inclusion in our growing community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/submit-temple"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition-all duration-200"
            >
              Submit a Temple
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 hover:text-white transition-all duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
