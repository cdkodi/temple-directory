// app/temples/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import TempleDetailClient from './TempleDetailClient'

// This makes the page static at build time
export const dynamic = 'force-static'

// Generate static params for all temples (SEO-friendly)
export async function generateStaticParams() {
  const supabase = createClient()
  
  const { data: temples } = await supabase
    .from('temples')
    .select('slug')
    .limit(1000) // Adjust based on your needs
  
  return temples?.map((temple) => ({
    slug: temple.slug,
  })) || []
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: temple } = await supabase
    .from('temples')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!temple) {
    return {
      title: 'Temple Not Found',
    }
  }

  return {
    title: `${temple.name} - ${temple.city}, ${temple.state} | Temple Directory`,
    description: `Visit ${temple.name} in ${temple.city}, ${temple.state}. ${temple.tradition} temple with ${temple.rating}★ rating. Find hours, directions, programs, and visitor information.`,
    keywords: [
      temple.name,
      temple.tradition,
      temple.city,
      temple.state,
      'hindu temple',
      'temple directory',
      'spiritual center'
    ].join(', '),
    openGraph: {
      title: temple.name,
      description: `${temple.tradition} temple in ${temple.city}, ${temple.state}`,
      type: 'website',
      locale: 'en_US',
      images: temple.image ? [
        {
          url: temple.image,
          width: 1200,
          height: 630,
          alt: temple.name,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: temple.name,
      description: `${temple.tradition} temple in ${temple.city}, ${temple.state}`,
      images: temple.image ? [temple.image] : [],
    },
    alternates: {
      canonical: `https://temple-directory.vercel.app/temples/${temple.slug}`,
    },
  }
}

// Main page component (Server Component for better SEO)
export default async function TempleDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const supabase = createClient()
  
  const { data: temple, error } = await supabase
    .from('temples')
    .select(`
      *,
      temple_programs(*),
      temple_facilities(*),
      temple_hours(*)
    `)
    .eq('slug', params.slug)
    .single()

  if (error || !temple) {
    notFound()
  }

  // Structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ReligiousOrganization",
    "name": temple.name,
    "description": temple.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": temple.address,
      "addressLocality": temple.city,
      "addressRegion": temple.state,
      "postalCode": temple.zip_code,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": temple.latitude,
      "longitude": temple.longitude
    },
    "telephone": temple.phone,
    "email": temple.email,
    "url": temple.website,
    "aggregateRating": temple.rating ? {
      "@type": "AggregateRating",
      "ratingValue": temple.rating,
      "reviewCount": temple.review_count
    } : undefined,
    "openingHours": temple.temple_hours?.map(h => 
      `${h.day_of_week} ${h.open_time}-${h.close_time}`
    ) || []
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      {/* Client Component for Interactive Features */}
      <TempleDetailClient temple={temple} />
    </>
  )
}

// app/temples/[slug]/TempleDetailClient.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, Clock, Star, Calendar, Users, Camera, Heart, Share2, ChevronDown, ChevronUp, Navigation } from 'lucide-react'

interface Temple {
  id: string
  name: string
  slug: string
  tradition: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  review_count?: number
  image?: string
  description?: string
  established_year?: number
  latitude?: number
  longitude?: number
  temple_programs?: Array<{
    id: string
    title: string
    description: string
    category: string
  }>
  temple_facilities?: Array<{
    id: string
    name: string
    description: string
  }>
  temple_hours?: Array<{
    day_of_week: string
    open_time: string
    close_time: string
    is_closed: boolean
  }>
}

export default function TempleDetailClient({ temple }: { temple: Temple }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: temple.name,
          text: `Check out ${temple.name} in ${temple.city}, ${temple.state}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const openInMaps = () => {
    const query = encodeURIComponent(`${temple.name} ${temple.address} ${temple.city} ${temple.state}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
          {temple.image && (
            <Image
              src={temple.image}
              alt={temple.name}
              fill
              className="object-cover opacity-80"
              priority
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-3 rounded-full shadow-lg transition-all ${
                isSaved ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-600'
              }`}
            >
              <Heart size={20} className={isSaved ? 'fill-current' : ''} />
            </button>
            <button 
              onClick={handleShare}
              className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <Share2 size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{temple.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {temple.tradition}
                </span>
                {temple.rating && (
                  <div className="flex items-center">
                    <Star className="text-yellow-400 fill-current" size={20} />
                    <span className="ml-1 text-lg font-semibold">{temple.rating}</span>
                    {temple.review_count && (
                      <span className="ml-2 text-white/80">({temple.review_count.toLocaleString()} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center text-white/90 mb-4">
                <MapPin size={16} className="mr-2" />
                <span>{temple.city}, {temple.state}</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={openInMaps}
                  className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Navigation size={16} className="mr-2" />
                  Get Directions
                </button>
                {temple.website && (
                  <Link 
                    href={temple.website}
                    target="_blank"
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center"
                  >
                    <Globe size={16} className="mr-2" />
                    Visit Website
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-2">
              <MapPin className="text-orange-500" size={20} />
              <h3 className="ml-2 font-semibold">Address</h3>
            </div>
            <p className="text-gray-600">{temple.address}</p>
            <p className="text-gray-600">{temple.city}, {temple.state} {temple.zip_code}</p>
          </div>
          
          {temple.phone && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-2">
                <Phone className="text-orange-500" size={20} />
                <h3 className="ml-2 font-semibold">Phone</h3>
              </div>
              <Link href={`tel:${temple.phone}`} className="text-orange-500 hover:underline">
                {temple.phone}
              </Link>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Clock className="text-orange-500" size={20} />
              <h3 className="ml-2 font-semibold">Hours</h3>
            </div>
            {temple.temple_hours && temple.temple_hours.length > 0 ? (
              <div className="text-sm text-gray-600">
                {temple.temple_hours.slice(0, 2).map((hour, index) => (
                  <div key={index}>
                    {hour.day_of_week}: {hour.is_closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                  </div>
                ))}
                {temple.temple_hours.length > 2 && (
                  <button 
                    onClick={() => toggleSection('hours')}
                    className="text-orange-500 hover:underline text-sm"
                  >
                    View all hours
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Hours not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'hours', label: 'Hours & Contact' },
                { id: 'programs', label: 'Programs' },
                { id: 'facilities', label: 'Facilities' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {temple.description && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">About {temple.name}</h3>
                    <p className="text-gray-700 leading-relaxed">{temple.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Quick Facts</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>Tradition: {temple.tradition}</li>
                      {temple.established_year && (
                        <li>Established: {temple.established_year}</li>
                      )}
                      <li>Location: {temple.city}, {temple.state}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Hours of Operation</h3>
                  {temple.temple_hours && temple.temple_hours.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {temple.temple_hours.map((hour, index) => (
                        <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{hour.day_of_week}</span>
                          <span className={hour.is_closed ? 'text-red-600' : 'text-gray-600'}>
                            {hour.is_closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Hours information not available. Please contact the temple directly.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {temple.phone && (
                      <div className="flex items-center">
                        <Phone size={16} className="text-gray-400 mr-3" />
                        <Link href={`tel:${temple.phone}`} className="text-orange-500 hover:underline">
                          {temple.phone}
                        </Link>
                      </div>
                    )}
                    {temple.email && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-3">@</span>
                        <Link href={`mailto:${temple.email}`} className="text-orange-500 hover:underline">
                          {temple.email}
                        </Link>
                      </div>
                    )}
                    {temple.website && (
                      <div className="flex items-center">
                        <Globe size={16} className="text-gray-400 mr-3" />
                        <Link href={temple.website} target="_blank" className="text-orange-500 hover:underline">
                          Visit Website
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'programs' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Programs & Activities</h3>
                {temple.temple_programs && temple.temple_programs.length > 0 ? (
                  <div className="space-y-4">
                    {temple.temple_programs.map((program) => (
                      <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{program.title}</h4>
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            {program.category}
                          </span>
                        </div>
                        <p className="text-gray-600">{program.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Program information not available. Please contact the temple for current offerings.</p>
                )}
              </div>
            )}

            {activeTab === 'facilities' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Facilities & Amenities</h3>
                {temple.temple_facilities && temple.temple_facilities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {temple.temple_facilities.map((facility) => (
                      <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{facility.name}</h4>
                        <p className="text-gray-600 text-sm">{facility.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Facility information not available. Please contact the temple for more details.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        {temple.latitude && temple.longitude && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map integration would go here</p>
              {/* You can integrate Google Maps, Mapbox, or another mapping solution */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
