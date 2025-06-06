import Link from 'next/link'

const traditions = [
  {
    name: 'Hindu Temples',
    slug: 'hindu',
    count: '600+',
    color: '#FF6B35',
    description: 'Discover diverse Hindu traditions, from ancient Vedic practices to modern spiritual centers.',
    highlights: ['Deity worship', 'Festival celebrations', 'Cultural programs', 'Spiritual education'],
    icon: '🕉️'
  },
  {
    name: 'Sikh Gurdwaras',
    slug: 'sikh',
    count: '150+',
    color: '#FF8500',
    description: 'Experience the teachings of Guru Nanak and the warm hospitality of Sikh communities.',
    highlights: ['Langar (free meals)', 'Kirtan (devotional music)', 'Community service', 'Equality & unity'],
    icon: '☬'
  },
  {
    name: 'Jain Temples',
    slug: 'jain',
    count: '50+',
    color: '#FFD23F',
    description: 'Explore the path of non-violence and spiritual liberation in Jain communities.',
    highlights: ['Ahimsa (non-violence)', 'Meditation practices', 'Spiritual discourses', 'Community welfare'],
    icon: '☸️'
  }
]

export default function TraditionCards() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Religious Traditions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn about different spiritual paths and find communities that resonate with your beliefs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {traditions.map((tradition, index) => (
            <div
              key={tradition.slug}
              className="card group hover:shadow-2xl transition-all duration-300"
            >
              <Link href={`/traditions/${tradition.slug}`}>
                <div className="p-8 text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${tradition.color}20`, color: tradition.color }}
                  >
                    {tradition.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {tradition.name}
                  </h3>
                  
                  <div 
                    className="text-3xl font-bold mb-4"
                    style={{ color: tradition.color }}
                  >
                    {tradition.count}
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    {tradition.description}
                  </p>
                  
                  <div className="space-y-2">
                    {tradition.highlights.map((highlight, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-center text-sm text-gray-600"
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-3"
                          style={{ backgroundColor: tradition.color }}
                        ></div>
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <span 
                      className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold group-hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: tradition.color }}
                    >
                      Explore {tradition.name}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
