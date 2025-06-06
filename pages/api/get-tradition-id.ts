// =====================================================
// pages/api/get-tradition-id.ts
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

  const { traditionName } = req.body

  if (!traditionName) {
    return res.status(400).json({ error: 'Tradition name is required' })
  }

  try {
    const { data, error } = await supabase
      .from('traditions')
      .select('id')
      .ilike('name', traditionName)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: `Tradition '${traditionName}' not found` })
    }

    res.status(200).json({ traditionId: data.id })
  } catch (error) {
    console.error('Error getting tradition ID:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
