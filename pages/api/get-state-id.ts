// =====================================================
// pages/api/get-state-id.ts
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { stateName } = req.body

  if (!stateName) {
    return res.status(400).json({ error: 'State name is required' })
  }

  try {
    // Try by abbreviation first (most common in US data)
    let { data, error } = await supabase
      .from('us_states')
      .select('id')
      .ilike('abbreviation', stateName.trim())
      .single()

    if (error || !data) {
      // Try by full name
      const result = await supabase
        .from('us_states')
        .select('id')
        .ilike('name', stateName.trim())
        .single()
      
      if (result.error || !result.data) {
        return res.status(404).json({ error: `State '${stateName}' not found` })
      }
      
      data = result.data
    }

    res.status(200).json({ stateId: data.id })
  } catch (error) {
    console.error('Error getting state ID:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
