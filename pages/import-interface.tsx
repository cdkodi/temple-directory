// pages/import-interface.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'

interface TempleData {
  id: number
  originalRow: any
  name: string
  tradition: string
  city: string
  state: string
  phone: string
  website: string
  rating: number | null
  reviews: number | null
  email: string
  address: string
  description: string
  status: 'valid' | 'warning' | 'error'
}

export default function ImportInterface() {
  const [templeData, setTempleData] = useState<TempleData[]>([])
  const [filteredData, setFilteredData] = useState<TempleData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showData, setShowData] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Filters
  const [nameFilter, setNameFilter] = useState('')
  const [traditionFilter, setTraditionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    warning: 0,
    error: 0
  })

  useEffect(() => {
    filterData()
  }, [nameFilter, traditionFilter, statusFilter, stateFilter, templeData])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setProgress(10)

    try {
      // Import XLSX dynamically
      const XLSX = await import('xlsx')
      
      setProgress(30)
      
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      
      setProgress(50)
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      setProgress(70)
      
      processTempleData(jsonData)
      setProgress(100)
      
      setTimeout(() => {
        setIsUploading(false)
        setShowData(true)
      }, 500)
      
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading Excel file. Please make sure it\'s a valid .xlsx file.')
      setIsUploading(false)
    }
  }

  const processTempleData = (rawData: any[]) => {
    const processed = rawData.map((row, index) => {
      const temple: TempleData = {
        id: index,
        originalRow: row,
        name: (row.name || '').toString().trim(),
        tradition: mapTradition(row.category, row.type, row.subtypes),
        city: (row.city || '').toString().trim(),
        state: (row.us_state || '').toString().trim(),
        phone: cleanPhone(row.phone),
        website: cleanWebsite(row.site),
        rating: parseFloat(row.rating) || null,
        reviews: parseInt(row.reviews) || null,
        email: (row.email_1 || '').toString().trim(),
        address: (row.full_address || row.street || '').toString().trim(),
        description: (row.description || '').toString().trim(),
        status: 'valid'
      }
      
      temple.status = validateTemple(temple)
      return temple
    })
    
    setTempleData(processed)
    updateStats(processed)
  }

  const mapTradition = (category: string, type: string, subtypes: string): string => {
    const fullText = `${category} ${type} ${subtypes}`.toLowerCase()
    
    if (fullText.includes('sikh') || fullText.includes('gurdwara')) return 'Sikh'
    if (fullText.includes('jain')) return 'Jain'
    if (fullText.includes('buddhist') || fullText.includes('buddha')) return 'Buddhist'
    return 'Hindu'
  }

  const cleanPhone = (phone: any): string => {
    if (!phone) return ''
    return phone.toString().replace(/[^\d]/g, '')
  }

  const cleanWebsite = (site: any): string => {
    if (!site) return ''
    const url = site.toString().trim()
    if (!url.startsWith('http')) return 'https://' + url
    return url
  }

  const validateTemple = (temple: TempleData): 'valid' | 'warning' | 'error' => {
    const errors = []
    const warnings = []
    
    if (!temple.name) errors.push('Missing name')
    if (!temple.city) warnings.push('Missing city')
    if (!temple.state) warnings.push('Missing state')
    if (temple.phone && temple.phone.length < 10) warnings.push('Invalid phone')
    if (temple.website && !temple.website.includes('.')) warnings.push('Invalid website')
    
    if (errors.length > 0) return 'error'
    if (warnings.length > 0) return 'warning'
    return 'valid'
  }

  const updateStats = (data: TempleData[]) => {
    const newStats = {
      total: data.length,
      valid: data.filter(t => t.status === 'valid').length,
      warning: data.filter(t => t.status === 'warning').length,
      error: data.filter(t => t.status === 'error').length
    }
    setStats(newStats)
  }

  const filterData = () => {
    const filtered = templeData.filter(temple => {
      return (!nameFilter || temple.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
             (!traditionFilter || temple.tradition === traditionFilter) &&
             (!statusFilter || temple.status === statusFilter) &&
             (!stateFilter || temple.state.toLowerCase().includes(stateFilter.toLowerCase()))
    })
    setFilteredData(filtered)
  }

  const updateTemple = (id: number, field: keyof TempleData, value: string) => {
    const updatedData = templeData.map(temple => {
      if (temple.id === id) {
        const updated = { ...temple, [field]: value }
        updated.status = validateTemple(updated)
        return updated
      }
      return temple
    })
    
    setTempleData(updatedData)
    updateStats(updatedData)
  }

  const deleteTemple = (id: number) => {
    if (confirm('Are you sure you want to delete this temple?')) {
      const updatedData = templeData.filter(t => t.id !== id)
      setTempleData(updatedData)
      updateStats(updatedData)
    }
  }

  const exportCorrectedData = async () => {
    const XLSX = await import('xlsx')
    
    const exportData = templeData.map(t => ({
      name: t.name,
      tradition: t.tradition,
      city: t.city,
      state: t.state,
      phone: t.phone,
      website: t.website,
      email: t.email,
      address: t.address,
      description: t.description,
      rating: t.rating,
      reviews: t.reviews,
      status: t.status
    }))
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Corrected Temples')
    XLSX.writeFile(wb, 'corrected-temples.xlsx')
  }

  return (
    <>
      <Head>
        <title>Temple Import Interface</title>
      </Head>
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', padding: '30px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏛️ Temple Data Import & Review</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Upload your US-Temples.xlsx file, review and edit the data, then import to Supabase</p>
          </div>
          
          <div style={{ padding: '30px' }}>
            
            {/* File Upload Section */}
            {!showData && (
              <div style={{ 
                background: '#f8f9fa', 
                border: '2px dashed #dee2e6', 
                borderRadius: '15px', 
                padding: '40px', 
                textAlign: 'center', 
                marginBottom: '30px' 
              }}>
                <h3>📁 Step 1: Upload Your Excel File</h3>
                <p style={{ margin: '15px 0' }}>Select your US-Temples.xlsx file to begin</p>
                
                <input 
                  type="file" 
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ margin: '20px 0' }}
                />
                
                {isUploading && (
                  <div style={{ width: '100%', height: '8px', background: '#e9ecef', borderRadius: '4px', margin: '20px 0', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #ff6b35, #f7931e)', 
                      width: `${progress}%`, 
                      transition: 'width 0.3s ease' 
                    }}></div>
                  </div>
                )}
              </div>
            )}
            
            {/* Statistics */}
            {showData && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0' }}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.total}</div>
                    <div>Total Temples</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.valid}</div>
                    <div>Valid Records</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.warning}</div>
                    <div>Needs Review</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.error}</div>
                    <div>Has Errors</div>
                  </div>
                </div>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '15px', margin: '20px 0', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Filter by temple name..." 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    style={{ padding: '10px 15px', border: '2px solid #dee2e6', borderRadius: '10px', fontSize: '1rem' }}
                  />
                  <select 
                    value={traditionFilter}
                    onChange={(e) => setTraditionFilter(e.target.value)}
                    style={{ padding: '10px 15px', border: '2px solid #dee2e6', borderRadius: '10px', fontSize: '1rem' }}
                  >
                    <option value="">All Traditions</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '10px 15px', border: '2px solid #dee2e6', borderRadius: '10px', fontSize: '1rem' }}
                  >
                    <option value="">All Status</option>
                    <option value="valid">Valid</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Filter by state..." 
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    style={{ padding: '10px 15px', border: '2px solid #dee2e6', borderRadius: '10px', fontSize: '1rem' }}
                  />
                </div>
                
                {/* Data Table */}
                <div style={{ overflowX: 'auto', margin: '20px 0', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white' }}>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Temple Name</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Tradition</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>City</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>State</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Phone</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Website</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Rating</th>
                        <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(temple => (
                        <tr key={temple.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              background: temple.status === 'valid' ? '#d4edda' : temple.status === 'warning' ? '#fff3cd' : '#f8d7da',
                              color: temple.status === 'valid' ? '#155724' : temple.status === 'warning' ? '#856404' : '#721c24'
                            }}>
                              {temple.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <input 
                              type="text" 
                              value={temple.name} 
                              onChange={(e) => updateTemple(temple.id, 'name', e.target.value)}
                              style={{ background: 'transparent', border: '1px solid transparent', padding: '5px', borderRadius: '5px', width: '100%', minWidth: '120px' }}
                            />
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <select 
                              value={temple.tradition}
                              onChange={(e) => updateTemple(temple.id, 'tradition', e.target.value)}
                              style={{ padding: '5px', border: '1px solid #dee2e6', borderRadius: '5px', background: 'white' }}
                            >
                              <option value="Hindu">Hindu</option>
                              <option value="Sikh">Sikh</option>
                              <option value="Jain">Jain</option>
                              <option value="Buddhist">Buddhist</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <input 
                              type="text" 
                              value={temple.city} 
                              onChange={(e) => updateTemple(temple.id, 'city', e.target.value)}
                              style={{ background: 'transparent', border: '1px solid transparent', padding: '5px', borderRadius: '5px', width: '100%', minWidth: '120px' }}
                            />
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <input 
                              type="text" 
                              value={temple.state} 
                              onChange={(e) => updateTemple(temple.id, 'state', e.target.value)}
                              style={{ background: 'transparent', border: '1px solid transparent', padding: '5px', borderRadius: '5px', width: '100%', minWidth: '80px' }}
                            />
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <input 
                              type="text" 
                              value={temple.phone} 
                              onChange={(e) => updateTemple(temple.id, 'phone', e.target.value)}
                              style={{ background: 'transparent', border: '1px solid transparent', padding: '5px', borderRadius: '5px', width: '100%', minWidth: '120px' }}
                            />
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <input 
                              type="text" 
                              value={temple.website} 
                              onChange={(e) => updateTemple(temple.id, 'website', e.target.value)}
                              style={{ background: 'transparent', border: '1px solid transparent', padding: '5px', borderRadius: '5px', width: '100%', minWidth: '150px' }}
                            />
                          </td>
                          <td style={{ padding: '12px 10px' }}>{temple.rating || '-'}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <button 
                              onClick={() => deleteTemple(temple.id)}
                              style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '15px', margin: '30px 0', justifyContent: 'center' }}>
                  <button 
                    onClick={exportCorrectedData}
                    style={{ 
                      padding: '15px 30px', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontSize: '1.1rem', 
                      cursor: 'pointer', 
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                      color: 'white'
                    }}
                  >
                    📤 Export Corrected Data
                  </button>
                  <button 
                    onClick={() => alert('Import functionality would connect to Supabase here!')}
                    style={{ 
                      padding: '15px 30px', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontSize: '1.1rem', 
                      cursor: 'pointer', 
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white'
                    }}
                  >
                    🚀 Import to Supabase
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
