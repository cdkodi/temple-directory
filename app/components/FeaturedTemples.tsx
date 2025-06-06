import Link from 'next/link'

const featuredTemples = [
  {
    id: 1,
    name: 'BAPS Swaminarayan Akshardham USA',
    city: 'Windsor',
    state: 'New Jersey',
    tradition: 'Hindu',
    rating: 4.8,
    reviews: 16519,
    description: 'World\'s second-largest Hindu temple, a masterpiece of traditional Indian architecture.',
    highlights: ['13 shrines', 'Cultural exhibitions', 'Traditional craftsmanship'],
    slug: 'baps-swaminarayan-akshardham-windsor-new-jersey'
  },
  {
    id: 2,
    name: 'Sri Venkateswara Temple',
    city: 'Pittsburgh',
    state: 'Pennsylvania',
    tradition: 'Hindu',
    rating: 4.8,
    reviews: 5410,
    description: 'First Hindu temple in US built by Indian immigrants, known as "Tirupati of America".',
    highlights: ['Historic significance', 'Hilltop location', 'Traditional rituals'],
    slug: 'sri-venkateswara-temple-pittsburgh-pennsylvania'
  },
  {
    id: 3,
    name: 'BAPS Shri Swaminarayan Mandir',
    city: 'Chino Hills',
    state: 'California',
    tradition: 'Hindu',
    rating: 4.8,
    reviews: 5400,
    description: 'First earthquake-proof traditional Hindu temple in the world.',
    highlights: ['Earthquake-resistant', 'Solar powered', '35,000 carved pieces'],
    slug: 'baps-shri-swaminarayan-mandir-chino-hills-california'
  }
]

export default function FeaturedTemples() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Temples
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most visited and highly-rated spiritual centers across the United States
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTemples.map((temple) => (
            <div key={temple.id} className="card group cursor-pointer">
              <Link href={`/temples/${temple.slug}`}>
                <div className="relative h-48 bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center">
                  <span className="text-white text-6xl">🏛️</span>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-white text-sm font-semibold bg-orange-600">
                      {temple.tradition}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {temple.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <span>📍 {temple.city}, {temple.state}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {temple.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span>⭐</span>
                      <span className="font-semibold text-gray-900 ml-1">{temple.rating}</span>
                      <span className="text-gray-600 ml-1">({temple.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {temple.highlights.map((highlight, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/temples" className="btn-primary">
            View All Temples
          </Link>
        </div>
      </div>
    </section>
  )
}
