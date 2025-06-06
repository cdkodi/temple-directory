'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TD</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Temple Directory
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/temples" className="text-gray-700 hover:text-orange-600 font-medium">
              Find Temples
            </Link>
            <Link href="/traditions" className="text-gray-700 hover:text-orange-600 font-medium">
              Traditions
            </Link>
            <Link href="/articles" className="text-gray-700 hover:text-orange-600 font-medium">
              Articles
            </Link>
            <Link href="/search" className="btn-primary">
              Search
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-700"
          >
            ☰
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <Link href="/temples" className="block text-gray-700 font-medium">
              Find Temples
            </Link>
            <Link href="/traditions" className="block text-gray-700 font-medium">
              Traditions
            </Link>
            <Link href="/articles" className="block text-gray-700 font-medium">
              Articles
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
