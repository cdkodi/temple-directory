// pages/test-connection.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [traditions, setTraditions] = useState([])
  const [temples, setTemples] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      
      // Test traditions
      const { data: traditionsData, error: traditionsError } = await supabase
        .from('traditions')
        .select('*')
        .limit(5)

      if (traditionsError) {
        throw new Error(`Traditions query failed: ${traditionsError.message}`)
      }

      setTraditions(traditionsData || [])

      // Test temples  
      const { data: templesData, error: templesError } = await supabase
        .from('temples')
        .select('id, name, city, status')
        .limit(5)

      if (templesError) {
        console.warn('Temples query failed (expected if no data yet):', templesError.message)
        setTemples([])
      } else {
        setTemples(templesData || [])
      }

      setConnectionStatus('✅ Connected successfully!')

    } catch (err) {
      console.error('Connection test failed:', err)
      setError(err.message)
      setConnectionStatus('❌ Connection failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Supabase Connection Test
          </h1>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className={`p-4 rounded-lg ${
              connectionStatus.includes('✅') ? 'bg-green-50 text-green-800' :
              connectionStatus.includes('❌') ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {connectionStatus}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-red-800 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          )}

          {/* Environment Variables Check */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Traditions Data */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Traditions Table ({traditions.length} rows)</h2>
            {traditions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {traditions.map((tradition) => (
                  <div key={tradition.id} className="p-4 border rounded-lg">
                    <div className="font-semibold">{tradition.name}</div>
                    <div className="text-sm text-gray-600">{tradition.description}</div>
                    <div 
                      className="inline-block w-4 h-4 rounded-full mt-2"
                      style={{ backgroundColor: tradition.color_code }}
                    ></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-600">
                No traditions found. Make sure you've run the SQL schema.
              </div>
            )}
          </div>

          {/* Temples Data */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Temples Table ({temples.length} rows)</h2>
            {temples.length > 0 ? (
              <div className="space-y-3">
                {temples.map((temple) => (
                  <div key={temple.id} className="p-4 border rounded-lg">
                    <div className="font-semibold">{temple.name}</div>
                    <div className="text-sm text-gray-600">{temple.city}</div>
                    <div className="text-xs text-gray-500">Status: {temple.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                No temples found yet. This is normal if you haven't imported your temple data.
                <br />
                <strong>Next step:</strong> Import your Excel data using the import script.
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={testConnection}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Connection Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
