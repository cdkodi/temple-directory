// app/api/homepage/featured-temples/route.ts
// Get featured temples for homepage

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('temples')
      .select(`
        id,
        name,
        city,
        slug,
        primary_image_url,
        google_rating,
        google_reviews_count,
        traditions:tradition_id(name),
        us_states:state_id(name, abbreviation)
      `)
      .eq('status', 'active')
      .order('google_reviews_count', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching featured temples:', error)
      return NextResponse.json({ error: 'Failed to fetch featured temples' }, { status: 500 })
    }

    const temples = data.map(temple => ({
      id: temple.id,
      name: temple.name,
      city: temple.city,
      state_name: temple.us_states?.abbreviation || 'Unknown',
      tradition_name: temple.traditions?.name || 'Unknown',
      google_rating: temple.google_rating,
      google_reviews_count: temple.google_reviews_count,
      primary_image_url: temple.primary_image_url,
      slug: temple.slug
    }))

    return NextResponse.json({ temples })
  } catch (error) {
    console.error('Error in featured-temples:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
