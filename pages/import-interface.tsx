// pages/import-interface.tsx (Complete Enhanced Version)
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
  const [editingTemple, setEditingTemple] = useState<number | null>(null)
  
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

  const addNewTemple = () => {
    const newId = Math.max(...templeData.map(t => t.id)) + 1
    const newTemple: TempleData = {
      id: newId,
      originalRow: {},
      name: 'New Temple',
      tradition: 'Hindu',
      city: '',
      state: '',
      phone: '',
      website: '',
      rating: null,
      reviews: null,
      email: '',
      address: '',
      description: '',
      status: 'warning'
    }
    
    const updatedData = [...templeData, newTemple]
    setTempleData(updatedData)
    updateStats(updatedData)
    setEditingTemple(newId)
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

  const EditableCell = ({ temple, field, value, type = 'text' }: { 
    temple: TempleData, 
    field: keyof TempleData, 
    value: string, 
    type?: string 
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value)

    const handleSave = () => {
      updateTemple(temple.id, field, tempValue)
      setIsEditing(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        setTempValue(value)
        setIsEditing(false)
      }
    }

    if (isEditing) {
      return (
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          autoFocus
          style={{
            width: '100%',
            padding: '8px',
            border: '2px solid #ff6b35',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      )
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        style={{
          padding: '8px',
          minHeight: '20px',
          cursor: 'pointer',
          borderRadius: '4px',
          border: '1px solid transparent',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa'
          e.currentTarget.style.border = '1px solid #dee2e6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.border = '1px solid transparent'
        }}
      >
        {value || <span style={{ color: '#999', fontStyle: 'italic' }}>Click to add...</span>}
      </div>
    )
  }

  const DetailModal = ({ temple, onClose }: { temple: TempleData, onClose: () => void }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#ff6b35' }}>Edit Temple Details</h2>
          <button onClick={onClose} style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer',
            color: '#999'
          }}>×</button>
        </div>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Temple Name *</label>
            <input
              type="text"
              value={temple.name}
              onChange={(e) => updateTemple(temple.id, 'name', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Tradition</label>
              <select
                value={temple.tradition}
                onChange={(e) => updateTemple(temple.id, 'tradition', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="Hindu">Hindu</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
              </select>
            </div>
            
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>State</label>
              <input
                type="text"
                value={temple.state}
                onChange={(e) => updateTemple(temple.id, 'state', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                placeholder="e.g., CA, NY, TX"
              />
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>City</label>
            <input
              type="text"
              value={temple.city}
              onChange={(e) => updateTemple(temple.id, 'city', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Full Address</label>
            <input
              type="text"
              value={temple.address}
              onChange={(e) => updateTemple(temple.id, 'address', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              placeholder="Street address"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Phone</label>
              <input
                type="tel"
                value={temple.phone}
                onChange={(e) => updateTemple(temple.id, 'phone', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Email</label>
              <input
                type="email"
                value={temple.email}
                onChange={(e) => updateTemple(temple.id, 'email', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                placeholder="info@temple.org"
              />
            </div>
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Website</label>
            <input
              type="url"
              value={temple.website}
              onChange={(e) => updateTemple(temple.id, 'website', e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              placeholder="https://www.temple.org"
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Description</label>
            <textarea
              value={temple.description}
              onChange={(e) => updateTemple(temple.id, 'description', e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', resize: 'vertical' }}
              placeholder="Brief description of the temple..."
            />
          </div>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )

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
            
            {/* Statistics and Controls */}
            {showData && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0' }}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.total}</div>
                    <div>Total Temples</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.valid}</div>
                    <div>Valid Records</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.warning}</div>
                    <div>Needs Review</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>{stats.error}</div>
                    <div>Has Errors</div>
                  </div>
                </div>
                
                {/* Add New Temple Button */}
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <button
                    onClick={addNewTemple}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Add New Temple
                  </button>
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
                          <td style={{ padding: '12px 10px', minWidth: '150px' }}>
                            <EditableCell temple={temple} field="name" value={temple.name} />
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <select 
                              value={temple.tradition}
                              onChange={(e) => updateTemple(temple.id, 'tradition', e.target.value)}
                              style={{ padding: '5px', border: '1px solid #dee2e6', borderRadius: '5px', background: 'white', width: '100%' }}
                            >
                              <option value="Hindu">Hindu</option>
                              <option value="Sikh">Sikh</option>
                              <option value="Jain">Jain</option>
                              <option value="Buddhist">Buddhist</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 10px', minWidth: '120px' }}>
                            <EditableCell temple={temple} field="city" value={temple.city} />
                          </td>
                          <td style={{ padding: '12px 10px', minWidth: '80px' }}>
                            <EditableCell temple={temple} field="state" value={temple.state} />
                          </td>
                          <td style={{ padding: '12px 10px', minWidth: '120px' }}>
                            <EditableCell temple={temple} field="phone" value={temple.phone} type="tel" />
                          </td>
                          <td style={{ padding: '12px 10px' }}>{temple.rating || '-'}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button 
                                onClick={() => setEditingTemple(temple.id)}
                                style={{ 
                                  background: '#007bff', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '5px 10px', 
                                  borderRadius: '5px', 
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => deleteTemple(temple.id)}
                                style={{ 
                                  background: '#dc3545', 
                                  color: 'white', 
                                  border: 'none', 
                                  padding: '5px 10px', 
                                  borderRadius: '5px', 
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '15px', margin: '30px 0', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                    onClick={() => alert('Import functionality will connect to Supabase here!')}
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
        
        {/* Detail Editing Modal */}
        {editingTemple !== null && (
          <DetailModal 
            temple={templeData.find(t => t.id === editingTemple)!}
            onClose={() => setEditingTemple(null)}
          />
        )}
      </div>
    </>
  )
}
