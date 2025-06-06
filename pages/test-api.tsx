// pages/api/test-connection.ts
// Create this file to test basic Supabase connection

import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseServiceKey
        }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test basic connection by counting traditions
    const { data, error } = await supabase
      .from('traditions')
      .select('id, name')
      .limit(10)

    if (error) {
      return res.status(500).json({ 
        error: 'Supabase query failed', 
        details: error.message 
      })
    }

    res.status(200).json({ 
      success: true,
      traditionCount: data?.length || 0,
      traditions: data?.map(t => t.name) || [],
      message: 'Supabase connection successful!'
    })
    
  } catch (error) {
    console.error('Connection test error:', error)
    res.status(500).json({ 
      error: 'Connection test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
