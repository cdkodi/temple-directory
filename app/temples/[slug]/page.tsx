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
    .not('slug', 'is', null)
    .limit(1000)
  
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
    .select(`
      *,
      traditions(name),
      states(name)
    `)
    .eq('slug', params.slug)
    .single()

  if (!temple) {
    return {
      title: 'Temple Not Found',
    }
  }

  const traditionName = temple.traditions?.name || 'Temple'
  const stateName = temple.states?.name || temple.state_id

  return {
    title: temple.meta_title || `${temple.name} - ${temple.city}, ${stateName} | Temple Directory`,
    description: temple.meta_description || `Visit ${temple.name} in ${temple.city}, ${stateName}. ${traditionName} temple with ${temple.google_rating}★ rating from ${temple.google_reviews_count} reviews. Find hours, directions, programs, and visitor information.`,
    keywords: [
      temple.name,
      temple.sanskrit_name,
      traditionName,
      temple.city,
      stateName,
      'temple directory',
      'spiritual center',
      'hindu temple',
      'sikh temple',
      'jain temple'
    ].filter(Boolean).join(', '),
    openGraph: {
      title: temple.name,
      description: `${traditionName} temple in ${temple.city}, ${stateName}`,
      type: 'website',
      locale: 'en_US',
      images: temple.primary_image_url ? [
        {
          url: temple.primary_image_url,
          width: 1200,
          height: 630,
          alt: temple.name,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: temple.name,
      description: `${traditionName} temple in ${temple.city}, ${stateName}`,
      images: temple.primary_image_url ? [temple.primary_image_url] : [],
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
      traditions(name),
      states(name, abbreviation),
      categories(name)
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
    "alternateName": temple.sanskrit_name,
    "description": temple.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": [temple.address_line1, temple.address_line2].filter(Boolean).join(', '),
      "addressLocality": temple.city,
      "addressRegion": temple.states?.abbreviation || temple.state_id,
      "postalCode": temple.postal_code,
      "addressCountry": temple.country || "US"
    },
    "geo": temple.latitude && temple.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": temple.latitude,
      "longitude": temple.longitude
    } : undefined,
    "telephone": temple.phone,
    "email": temple.email,
    "url": temple.website_url,
    "image": temple.primary_image_url,
    "aggregateRating": temple.google_rating ? {
      "@type": "AggregateRating",
      "ratingValue": temple.google_rating,
      "reviewCount": temple.google_reviews_count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "openingHours": temple.operating_hours ? 
      Object.entries(temple.operating_hours).map(([day, hours]: [string, any]) => 
        hours.closed ? undefined : `${day} ${hours.open}-${hours.close}`
      ).filter(Boolean) : undefined,
    "sameAs": [
      temple.facebook_url,
      temple.instagram_url,
      temple.youtube_url
    ].filter(Boolean)
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
