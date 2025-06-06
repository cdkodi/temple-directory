// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =====================================================
// TEMPLE DATA TYPES
// =====================================================

export interface Temple {
  id: string
  name: string
  sanskrit_name?: string
  city: string
  state_id: string
  latitude?: number
  longitude?: number
  primary_image_url?: string
  google_rating?: number
  google_reviews_count?: number
  is_featured: boolean
  status: 'active' | 'inactive' | 'pending' | 'closed'
  slug: string
  tradition_id: string
  description?: string
  website_url?: string
  phone?: string
  services?: string[]
  amenities?: string[]
  operating_hours?: any
  created_at: string
  updated_at: string
}

export interface Tradition {
  id: string
  name: string
  description?: string
  color_code: string
  icon_name?: string
}

export interface TempleWithDetails extends Temple {
  tradition_name: string
  tradition_color: string
  state_name: string
  state_abbr: string
  deities?: string[]
  tags?: string[]
}

// =====================================================
// TEMPLE API FUNCTIONS
// =====================================================

// Get all active temples
export async function getTemples(limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('temple_summary')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('google_reviews_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching temples:', error)
    return { temples: [], error }
  }

  return { temples: data, error: null }
}

// Get featured temples for homepage
export async function getFeaturedTemples(limit = 6) {
  const { data, error } = await supabase
    .from('temple_summary')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('google_reviews_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured temples:', error)
    return { temples: [], error }
  }

  return { temples: data, error: null }
}

// Get temple by slug
export async function getTempleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('temples')
    .select(`
      *,
      traditions:tradition_id(name, color_code),
      us_states:state_id(name, abbreviation),
      temple_shrines(
        *,
        deities(name, sanskrit_name, description, image_url)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching temple:', error)
    return { temple: null, error }
  }

  return { temple: data, error: null }
}

// Search temples by location
export async function searchTemplesByLocation(
  latitude: number,
  longitude: number,
  radiusMiles = 25,
  limit = 20
) {
  const { data, error } = await supabase
    .rpc('search_temples_by_location', {
      search_lat: latitude,
      search_lng: longitude,
      radius_miles: radiusMiles
    })
    .limit(limit)

  if (error) {
    console.error('Error searching temples by location:', error)
    return { temples: [], error }
  }

  return { temples: data, error: null }
}

// Search temples by text
export async function searchTemples(searchTerm: string, filters: any = {}) {
  let query = supabase
    .from('temple_summary')
    .select('*')
    .eq('status', 'active')

  // Text search across name and city
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
  }

  // Filter by tradition
  if (filters.tradition) {
    query = query.eq('tradition_name', filters.tradition)
  }

  // Filter by state
  if (filters.state) {
    query = query.eq('state_abbr', filters.state)
  }

  // Order results
  query = query
    .order('is_featured', { ascending: false })
    .order('google_reviews_count', { ascending: false })
    .limit(20)

  const { data, error } = await query

  if (error) {
    console.error('Error searching temples:', error)
    return { temples: [], error }
  }

  return { temples: data, error: null }
}

// Get temples by tradition
export async function getTemplesByTradition(traditionName: string, limit = 20) {
  const { data, error } = await supabase
    .from('temple_summary')
    .select('*')
    .eq('status', 'active')
    .eq('tradition_name', traditionName)
    .order('is_featured', { ascending: false })
    .order('google_reviews_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching temples by tradition:', error)
    return { temples: [], error }
  }

  return { temples: data, error: null }
}

// Get all traditions with temple counts
export async function getTraditions() {
  const { data, error } = await supabase
    .from('traditions')
    .select(`
      *,
      temples:temples(count)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching traditions:', error)
    return { traditions: [], error }
  }

  return { traditions: data, error: null }
}

// Get current user session
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting user session:', error)
    return { user: null, error }
  }

  return { user: session?.user || null, error: null }
}
