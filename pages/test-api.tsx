// pages/test-api.tsx
// Fixed version that won't cause SSR issues

import React, { useState } from 'react'
import Head from 'next/head'

export default function TestApiPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string, success: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString()
    const icon = success ? '✅' : '❌'
    setResults(prev => [...prev, `${timestamp} ${icon} ${message}`])
  }

  const testTraditionApi = async () => {
    try {
      addResult('Testing tradition API...', true)
      
      const response = await fetch('/api/get-tradition-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traditionName: 'Hindu' })
      })
      
      if (response.ok) {
        const data = await response.json()
        addResult(`Tradition API works! Hindu ID: ${data.traditionId}`, true)
      } else {
        const errorText = await response.text()
        addResult(`Tradition API failed: ${response.status} - ${errorText}`, false)
      }
    } catch (error) {
      addResult(`Tradition API error: ${String(error)}`, false)
    }
  }

  const testStateApi = async () => {
    try {
      addResult('Testing state API...', true)
      
      const response = await fetch('/api/get-state-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stateName: 'CA' })
      })
      
      if (response.ok) {
        const data = await response.json()
        addResult(`State API works! CA ID: ${data.stateId}`, true)
      } else {
        const errorText = await response.text()
        addResult(`State API failed: ${response.status} - ${errorText}`, false)
      }
    } catch (error) {
      addResult(`State API error: ${String(error)}`, false)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      addResult('Testing Supabase connection...', true)
      
      const response = await fetch('/api/test-connection', {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        addResult(`Supabase connection works! Found ${data.traditionCount} traditions`, true)
      } else {
        const errorText = await response.text()
        addResult(`Supabase connection failed: ${response.status} - ${errorText}`, false)
      }
    } catch (error) {
      addResult(`Supabase connection error: ${String(error)}`, false)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])
    
    addResult('🚀 Starting API tests...', true)
    
    await testSupabaseConnection()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testTraditionApi()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testStateApi()
    
    addResult('✨ All tests completed!', true)
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <>
      <Head>
        <title>API Test Page</title>
      </Head>
      
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '20px' 
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          background: 'white', 
          borderRadius: '20px', 
          padding: '30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          
          <h1 style={{ 
            textAlign: 'center', 
            color: '#ff6b35', 
            marginBottom: '30px',
            fontSize: '2.5rem'
          }}>
            🔧 API Test Page
          </h1>
          
          <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
            Test your Supabase API endpoints to diagnose import issues
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '30px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={runAllTests}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#cccccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {loading ? '🔄 Testing...' : '🚀 Run All Tests'}
            </button>
            
            <button
              onClick={testSupabaseConnection}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#cccccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              Test Supabase
            </button>
            
            <button
              onClick={clearResults}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Clear Results
            </button>
          </div>

          <div style={{
            background: '#2d3748',
            color: '#e2e8f0',
            padding: '20px',
            borderRadius: '10px',
            fontFamily: 'Courier New, monospace',
            minHeight: '200px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {results.length === 0 ? (
              <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                Click &quot;Run All Tests&quot; to start testing your APIs...
              </div>
            ) : (
              results.map((result, index) => (
                <div key={index} style={{ margin: '5px 0' }}>
                  {result}
                </div>
              ))
            )}
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '10px' 
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '10px' }}>🔍 What This Tests:</h3>
            <ul style={{ color: '#666', lineHeight: '1.6' }}>
              <li><strong>Supabase Connection:</strong> Can we connect to your database?</li>
              <li><strong>Tradition API:</strong> Can we look up Hindu/Sikh/Jain traditions?</li>
              <li><strong>State API:</strong> Can we look up US states?</li>
              <li><strong>Environment Variables:</strong> Are your Supabase credentials set?</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
