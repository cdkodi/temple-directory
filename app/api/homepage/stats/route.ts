// =====================================================
// app/api/homepage/stats/route.ts
// Fixed version with proper error handling
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Get total temple count
    const { count: totalTemples, error: countError } = await supabase
      .from('temples')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (countError) {
      console.error('Error counting temples:', countError)
    }

    // Get unique states count
    const { data: statesData, error: statesError } = await supabase
      .from('temples')
      .select('state_id')
      .eq('status', 'active')
      .not('state_id', 'is', null)

    if (statesError) {
      console.error('Error fetching states:', statesError)
    }

    const uniqueStates = statesData ? new Set(statesData.map((t: any) => t.state_id)).size : 0

    // Get average rating
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('temples')
      .select('google_rating')
      .eq('status', 'active')
      .not('google_rating', 'is', null)

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError)
    }

    let avgRating = 0
    if (ratingsData && ratingsData.length > 0) {
      const sum = ratingsData.reduce((acc: number, t: any) => acc + (t.google_rating || 0), 0)
      avgRating = sum / ratingsData.length
    }

    const stats = {
      totalTemples: totalTemples || 0,
      totalStates: uniqueStates,
      avgRating: Number(avgRating.toFixed(1))
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in stats:', error)
    return NextResponse.json({ 
      stats: {
        totalTemples: 0,
        totalStates: 0,
        avgRating: 0
      }
    }, { status: 200 })
  }
}
