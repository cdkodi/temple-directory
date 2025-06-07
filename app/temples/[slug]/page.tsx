// app/temples/[slug]/page.tsx (Replace your current content temporarily)
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

// Remove static generation for now to debug
// export const dynamic = 'force-static'

export default async function TempleDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  console.log('Temple page accessed with slug:', params.slug)
  
  const supabase = createClient()
  
  // Simple query first
  const { data: temple, error } = await supabase
    .from('temples')
    .select('*')
    .eq('slug', params.slug)
    .single()

  console.log('Query result:', { temple: temple?.name, error })

  if (error) {
    console.log('Supabase error:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Database Error</h1>
        <p>Error: {error.message}</p>
        <p>Details: {JSON.stringify(error, null, 2)}</p>
        <p className="mt-4">Looking for slug: <strong>{params.slug}</strong></p>
      </div>
    )
  }

  if (!temple) {
    console.log('No temple found for slug:', params.slug)
    
    // Let's also check what slugs actually exist
    const { data: allSlugs } = await supabase
      .from('temples')
      .select('slug, name')
      .not('slug', 'is', null)
      .limit(10)
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Temple Not Found</h1>
        <p>No temple found with slug: <strong>{params.slug}</strong></p>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Available temple slugs:</h2>
          <ul className="list-disc list-inside">
            {allSlugs?.map((t) => (
              <li key={t.slug}>
                <a href={`/temples/${t.slug}`} className="text-blue-500 hover:underline">
                  {t.slug} - {t.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{temple.name}</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <p><strong>Slug:</strong> {temple.slug}</p>
        <p><strong>City:</strong> {temple.city}</p>
        <p><strong>State:</strong> {temple.state_id}</p>
        <p><strong>Tradition ID:</strong> {temple.tradition_id}</p>
        <p><strong>Rating:</strong> {temple.google_rating}</p>
        <p><strong>Reviews:</strong> {temple.google_reviews_count}</p>
      </div>
      
      {temple.description && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p>{temple.description}</p>
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Raw Data</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(temple, null, 2)}
        </pre>
      </div>
    </div>
  )
}
