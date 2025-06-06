// =====================================================
// pages/api/insert-temple.ts
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

  const templeData = req.body

  if (!templeData.name || !templeData.tradition_id) {
    return res.status(400).json({ error: 'Temple name and tradition are required' })
  }

  try {
    // Check if temple with same name already exists
    const { data: existingTemple } = await supabase
      .from('temples')
      .select('id, name')
      .eq('name', templeData.name)
      .single()

    if (existingTemple) {
      return res.status(409).json({ error: `Temple '${templeData.name}' already exists` })
    }

    // Insert the temple
    const { data, error } = await supabase
      .from('temples')
      .insert([{
        ...templeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json({ temple: data })
  } catch (error) {
    console.error('Error inserting temple:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
