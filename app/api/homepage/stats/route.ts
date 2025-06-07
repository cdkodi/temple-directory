// =====================================================
// app/api/homepage/stats/route.ts
// Get overall statistics for homepage
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Get total temple count
    const { count: totalTemples } = await supabase
      .from('temples')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get unique states count
    const { data: statesData } = await supabase
      .from('temples')
      .select('state_id')
      .eq('status', 'active')
      .not('state_id', 'is', null)

    const uniqueStates = new Set(statesData?.map(t => t.state_id)).size

    // Get average rating
    const { data: ratingsData } = await supabase
      .from('temples')
      .select('google_rating')
      .eq('status', 'active')
      .not('google_rating', 'is', null)

    const avgRating = ratingsData && ratingsData.length > 0 
      ? ratingsData.reduce((sum, t) => sum + (t.google_rating || 0), 0) / ratingsData.length
      : 0

    const stats = {
      totalTemples: totalTemples || 0,
      totalStates: uniqueStates,
      avgRating: Number(avgRating.toFixed(1))
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
