import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="py-16 gradient-hero text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Is Your Temple Listed?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Help us build the most comprehensive directory of spiritual centers in America. 
            Add your temple or suggest updates to existing listings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit-temple" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
              Add Your Temple
            </Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold py-3 px-8 rounded-lg transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
