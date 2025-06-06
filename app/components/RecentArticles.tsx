import Link from 'next/link'

const articles = [
  {
    title: "Understanding the Significance of Ganesha in Hindu Worship",
    excerpt: "Explore the deep spiritual meaning behind Lord Ganesha and why devotees seek his blessings before starting any new venture.",
    slug: "significance-of-ganesha-hindu-worship",
    category: "Deity Guides",
    readTime: "5 min read",
    image: "/images/ganesha-article.jpg"
  },
  {
    title: "A Guide to Celebrating Diwali at Your Local Temple",
    excerpt: "Discover how different temples across America celebrate the Festival of Lights and how you can participate.",
    slug: "celebrating-diwali-local-temple-guide",
    category: "Festivals",
    readTime: "7 min read",
    image: "/images/diwali-article.jpg"
  },
  {
    title: "The Architecture of American Hindu Temples",
    excerpt: "From traditional Dravidian styles to modern adaptations, explore how temple architecture evolved in America.",
    slug: "architecture-american-hindu-temples",
    category: "Architecture",
    readTime: "10 min read",
    image: "/images/architecture-article.jpg"
  }
]

export default function RecentArticles() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recent Articles
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Deepen your understanding of spiritual traditions and temple practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={article.slug}
              className="card group"
            >
              <Link href={`/articles/${article.slug}`}>
                <div className="relative h-48 bg-gradient-to-r from-orange-200 to-yellow-200 flex items-center justify-center">
                  <span className="text-6xl">📖</span>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-sm text-orange-600 font-semibold">
                      {article.category}
                    </span>
                    <span className="text-gray-500 mx-2">•</span>
                    <span className="text-sm text-gray-500">
                      {article.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-4">
                    <span className="text-orange-600 font-semibold group-hover:underline">
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/articles" className="btn-primary">
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  )
}
