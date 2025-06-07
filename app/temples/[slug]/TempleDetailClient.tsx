// app/temples/[slug]/TempleDetailClient.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Globe, Clock, Star, Calendar, Users, Camera, Heart, Share2, ChevronDown, ChevronUp, Navigation, Facebook, Instagram, Youtube, MapIcon } from 'lucide-react'

interface Temple {
  id: string
  name: string
  sanskrit_name?: string
  slug: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  country?: string
  phone?: string
  email?: string
  website_url?: string
  google_rating?: number
  google_reviews_count?: number
  primary_image_url?: string
  gallery_images?: any[]
  description?: string
  history?: string
  established_year?: number
  architectural_style?: string
  services?: any
  amenities?: any
  languages?: any
  operating_hours?: any
  latitude?: number
  longitude?: number
  facebook_url?: string
  instagram_url?: string
  youtube_url?: string
  virtual_tour_url?: string
  status?: string
  is_featured?: boolean
  traditions?: { name: string }
  states?: { name: string; abbreviation: string }
  categories?: { name: string }
}

export default function TempleDetailClient({ temple }: { temple: Temple }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: temple.name,
          text: `Check out ${temple.name} in ${temple.city}, ${temple.states?.name}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const openInMaps = () => {
    const address = [
      temple.address_line1,
      temple.address_line2,
      temple.city,
      temple.states?.name,
      temple.postal_code
    ].filter(Boolean).join(' ')
    
    const query = encodeURIComponent(`${temple.name} ${address}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const galleryImages = temple.gallery_images || []
  const hasGallery = galleryImages.length > 0

  // Parse operating hours
  const formatOperatingHours = () => {
    if (!temple.operating_hours) return null
    
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    return daysOrder.map(day => {
      const hours = temple.operating_hours[day]
      if (!hours) return null
      
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`,
        isClosed: hours.closed
      }
    }).filter(Boolean)
  }

  const operatingHours = formatOperatingHours()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-96 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
          {temple.primary_image_url && (
            <Image
              src={temple.primary_image_url}
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
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">{temple.name}</h1>
              {temple.sanskrit_name && (
                <p className="text-xl text-white/90 mb-4 italic">{temple.sanskrit_name}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {temple.traditions?.name && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {temple.traditions.name}
                  </span>
                )}
                {temple.categories?.name && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {temple.categories.name}
                  </span>
                )}
                {temple.is_featured && (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>

              {temple.google_rating && (
                <div className="flex items-center mb-4">
                  <Star className="text-yellow-400 fill-current" size={20} />
                  <span className="ml-1 text-lg font-semibold">{temple.google_rating}</span>
                  {temple.google_reviews_count && (
                    <span className="ml-2 text-white/80">({temple.google_reviews_count.toLocaleString()} reviews)</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-white/90 mb-4">
                <MapPin size={16} className="mr-2" />
                <span>{temple.city}, {temple.states?.name}</span>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={openInMaps}
                  className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Navigation size={16} className="mr-2" />
                  Get Directions
                </button>
                {temple.website_url && (
                  <Link 
                    href={temple.website_url}
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
            {temple.address_line1 && <p className="text-gray-600">{temple.address_line1}</p>}
            {temple.address_line2 && <p className="text-gray-600">{temple.address_line2}</p>}
            <p className="text-gray-600">{temple.city}, {temple.states?.abbreviation} {temple.postal_code}</p>
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
            {operatingHours && operatingHours.length > 0 ? (
              <div className="text-sm text-gray-600">
                {operatingHours.slice(0, 2).map((hour, index) => (
                  <div key={index}>
                    {hour.day}: {hour.hours}
                  </div>
                ))}
                {operatingHours.length > 2 && (
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
                { id: 'services', label: 'Services' },
                { id: 'amenities', label: 'Amenities' },
                ...(hasGallery ? [{ id: 'gallery', label: 'Gallery' }] : []),
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

                {temple.history && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">History</h3>
                    <p className="text-gray-700 leading-relaxed">{temple.history}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Temple Information</h4>
                    <ul className="space-y-1 text-gray-600">
                      {temple.traditions?.name && <li>Tradition: {temple.traditions.name}</li>}
                      {temple.categories?.name && <li>Category: {temple.categories.name}</li>}
                      {temple.established_year && <li>Established: {temple.established_year}</li>}
                      {temple.architectural_style && <li>Style: {temple.architectural_style}</li>}
                      <li>Location: {temple.city}, {temple.states?.name}</li>
                    </ul>
                  </div>

                  {temple.languages && Object.keys(temple.languages).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(temple.languages).map(([lang, supported]) => 
                          supported ? (
                            <span key={lang} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {lang}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(temple.facebook_url || temple.instagram_url || temple.youtube_url) && (
                  <div>
                    <h4 className="font-semibold mb-3">Follow Us</h4>
                    <div className="flex space-x-4">
                      {temple.facebook_url && (
                        <Link href={temple.facebook_url} target="_blank" className="text-blue-600 hover:text-blue-800">
                          <Facebook size={24} />
                        </Link>
                      )}
                      {temple.instagram_url && (
                        <Link href={temple.instagram_url} target="_blank" className="text-pink-600 hover:text-pink-800">
                          <Instagram size={24} />
                        </Link>
                      )}
                      {temple.youtube_url && (
                        <Link href={temple.youtube_url} target="_blank" className="text-red-600 hover:text-red-800">
                          <Youtube size={24} />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Hours of Operation</h3>
                  {operatingHours && operatingHours.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {operatingHours.map((hour, index) => (
                        <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{hour.day}</span>
                          <span className={hour.isClosed ? 'text-red-600' : 'text-gray-600'}>
                            {hour.hours}
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
                    {temple.website_url && (
                      <div className="flex items-center">
                        <Globe size={16} className="text-gray-400 mr-3" />
                        <Link href={temple.website_url} target="_blank" className="text-orange-500 hover:underline">
                          Visit Website
                        </Link>
                      </div>
                    )}
                    {temple.virtual_tour_url && (
                      <div className="flex items-center">
                        <Camera size={16} className="text-gray-400 mr-3" />
                        <Link href={temple.virtual_tour_url} target="_blank" className="text-orange-500 hover:underline">
                          Virtual Tour
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Services & Programs</h3>
                {temple.services && Object.keys(temple.services).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(temple.services).map(([service, available]) => 
                      available ? (
                        <div key={service} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold capitalize">{service.replace('_', ' ')}</h4>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Service information not available. Please contact the temple for current offerings.</p>
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Facilities & Amenities</h3>
                {temple.amenities && Object.keys(temple.amenities).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(temple.amenities).map(([amenity, available]) => 
                      available ? (
                        <div key={amenity} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold capitalize">{amenity.replace('_', ' ')}</h4>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Amenity information not available. Please contact the temple for more details.</p>
                )}
              </div>
            )}

            {activeTab === 'gallery' && hasGallery && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Photo Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                      <Image
                        src={image.url || image}
                        alt={`${temple.name} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        {temple.latitude && temple.longitude && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapIcon size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive map integration</p>
                <button 
                  onClick={openInMaps}
                  className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View in Google Maps
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
