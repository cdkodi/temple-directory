import Link from 'next/link'

export default function Footer() {
  const quickLinks = [
    { href: '/temples', label: 'Find Temples' },
    { href: '/articles', label: 'Articles' },
    { href: '/festivals', label: 'Festivals' },
    { href: '/traditions', label: 'Traditions' },
  ]

  const traditions = [
    { href: '/traditions/hindu', label: 'Hindu Temples' },
    { href: '/traditions/sikh', label: 'Sikh Gurdwaras' },
    { href: '/traditions/jain', label: 'Jain Temples' },
    { href: '/traditions/buddhist', label: 'Buddhist Centers' },
  ]

  const support = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/submit-temple', label: 'Submit Temple' },
    { href: '/privacy', label: 'Privacy Policy' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TD</span>
              </div>
              <span className="font-bold text-xl">Temple Directory</span>
            </div>
            <p className="text-gray-400 mb-6">
              Connecting communities with spiritual centers across America.
            </p>
            <div className="flex space-x-4">
              <span className="text-gray-400 hover:text-white cursor-pointer">📘</span>
              <span className="text-gray-400 hover:text-white cursor-pointer">🐦</span>
              <span className="text-gray-400 hover:text-white cursor-pointer">📷</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Traditions */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Traditions</h3>
            <ul className="space-y-2">
              {traditions.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Temple Directory USA. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
