// pages/api/insert-temple.ts
// Updated version that handles duplicate temple names better

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
    // Check if temple with same name, city, and state already exists
    const { data: existingTemple } = await supabase
      .from('temples')
      .select('id, name, city, state_id')
      .eq('name', templeData.name)
      .eq('city', templeData.city || '')
      .eq('state_id', templeData.state_id || null)
      .single()

    if (existingTemple) {
      return res.status(409).json({ 
        error: `Temple "${templeData.name}" already exists in ${templeData.city || 'this location'}`,
        suggestion: 'Consider updating the existing temple instead of creating a duplicate'
      })
    }

    // Generate unique slug - add suffix if needed
    let baseSlug = generateSlug(templeData.name)
    let slug = baseSlug
    let counter = 1

    // Check if slug already exists and modify if needed
    while (true) {
      const { data: existingSlug } = await supabase
        .from('temples')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existingSlug) {
        break // Slug is unique
      }

      // Add suffix to make it unique
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Insert the temple with unique slug
    const { data, error } = await supabase
      .from('temples')
      .insert([{
        ...templeData,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      
      // Handle specific error types
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('name')) {
          return res.status(409).json({ 
            error: `A temple named "${templeData.name}" already exists`,
            suggestion: 'Try adding the city name to make it unique, like "Temple Name - City"'
          })
        }
        if (error.message.includes('slug')) {
          return res.status(409).json({ 
            error: 'URL slug conflict - please try again',
            suggestion: 'The system will generate a new unique URL'
          })
        }
      }
      
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json({ temple: data })
  } catch (error) {
    console.error('Error inserting temple:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper function to generate URL-friendly slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
