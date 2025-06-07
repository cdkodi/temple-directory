// =====================================================
// app/api/homepage/traditions/route.ts
// Fixed version with proper error handling
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Get all traditions
    const { data: traditionsData, error } = await supabase
      .from('traditions')
      .select('id, name, color_code')
      .order('name')

    if (error) {
      console.error('Error fetching traditions:', error)
      return NextResponse.json({ error: 'Failed to fetch traditions' }, { status: 500 })
    }

    if (!traditionsData) {
      return NextResponse.json({ traditions: [] })
    }

    // Count active temples for each tradition
    const traditionCounts = await Promise.all(
      traditionsData.map(async (tradition: any) => {
        try {
          const { count } = await supabase
            .from('temples')
            .select('*', { count: 'exact', head: true })
            .eq('tradition_id', tradition.id)
            .eq('status', 'active')

          return {
            id: tradition.id,
            name: tradition.name,
            color_code: tradition.color_code,
            temple_count: count || 0
          }
        } catch (countError) {
          console.error(`Error counting temples for ${tradition.name}:`, countError)
          return {
            id: tradition.id,
            name: tradition.name,
            color_code: tradition.color_code,
            temple_count: 0
          }
        }
      })
    )

    return NextResponse.json({ traditions: traditionCounts })
  } catch (error) {
    console.error('Error in traditions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
