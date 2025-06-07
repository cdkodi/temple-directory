// pages/import-interface.tsx
// Complete file with all latest changes
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

  // SUPABASE IMPORT FUNCTION
  const importToSupabase = async () => {
    console.log('Import button clicked!') // Debug log
    
    const logContainer = document.getElementById('logContainer')
    const log = document.getElementById('importLog')
    
    // Show the log container
    if (logContainer) {
      logContainer.style.display = 'block'
      console.log('Log container shown')
    } else {
      console.error('Log container not found!')
      alert('Log container not found. Please check if the HTML is properly set up.')
      return
    }
    
    // Clear previous logs
    if (log) {
      log.innerHTML = ''
    }
    
    addLog('🚀 Starting Supabase import...', 'info')
    addLog(`📊 Found ${templeData.length} temples to process`, 'info')
    
    // Filter out invalid temples
    const validTemples = templeData.filter(temple => temple.status !== 'error')
    const invalidCount = templeData.length - validTemples.length
    
    if (invalidCount > 0) {
      addLog(`⚠️ Skipping ${invalidCount} temples with errors`, 'warning')
    }
    
    addLog(`✅ Processing ${validTemples.length} valid temples`, 'info')
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    // Import temples one by one
    for (let i = 0; i < validTemples.length; i++) {
      const temple = validTemples[i]
      
      try {
        addLog(`Processing: ${temple.name} (${i + 1}/${validTemples.length})`, 'info')
        
        // Get tradition ID
        addLog(`  Looking up tradition: ${temple.tradition}`, 'info')
        const traditionResponse = await fetch('/api/get-tradition-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traditionName: temple.tradition })
        })
        
        if (!traditionResponse.ok) {
          throw new Error(`Failed to get tradition ID for ${temple.tradition}`)
        }
        
        const { traditionId } = await traditionResponse.json()
        addLog(`  ✅ Found tradition ID: ${traditionId}`, 'success')
        
        // Get state ID
        let stateId = null
        if (temple.state) {
          addLog(`  Looking up state: ${temple.state}`, 'info')
          const stateResponse = await fetch('/api/get-state-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stateName: temple.state })
          })
          
          if (stateResponse.ok) {
            const stateData = await stateResponse.json()
            stateId = stateData.stateId
            addLog(`  ✅ Found state ID: ${stateId}`, 'success')
          } else {
            addLog(`  ⚠️ Could not find state: ${temple.state}`, 'warning')
          }
        }
        
        // Prepare temple data for Supabase
        const templeForDb = {
          name: temple.name,
          tradition_id: traditionId,
          city: temple.city || null,
          state_id: stateId,
          phone: temple.phone || null,
          email: temple.email || null,
          website_url: temple.website || null,
          address_line1: temple.address || null,
          description: temple.description || null,
          google_rating: temple.rating,
          google_reviews_count: temple.reviews,
          slug: generateSlug(temple.name),
          status: 'active',
          verification_status: 'unverified'
        }
        
        addLog(`  Inserting temple into database...`, 'info')
        
        // Insert temple into Supabase
        const insertResponse = await fetch('/api/insert-temple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templeForDb)
        })
        
        if (!insertResponse.ok) {
          const errorData = await insertResponse.json()
          throw new Error(errorData.error || 'Failed to insert temple')
        }
        
        successCount++
        addLog(`✅ Successfully imported: ${temple.name}`, 'success')
        
      } catch (error) {
        errorCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        addLog(`❌ Error importing ${temple.name}: ${errorMessage}`, 'error')
        errors.push(`${temple.name}: ${errorMessage}`)
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    // Final summary
    addLog('', 'info')
    addLog('='.repeat(50), 'info')
    addLog('🎯 IMPORT SUMMARY', 'info')
    addLog('='.repeat(50), 'info')
    addLog(`📊 Total temples processed: ${validTemples.length}`, 'info')
    addLog(`✅ Successfully imported: ${successCount}`, 'success')
    addLog(`❌ Errors: ${errorCount}`, errorCount > 0 ? 'error' : 'info')
    
    if (validTemples.length > 0) {
      const successRate = Math.round((successCount / validTemples.length) * 100)
      addLog(`📈 Success rate: ${successRate}%`, 'info')
    }
    
    if (errors.length > 0) {
      addLog('', 'error')
      addLog('❌ ERROR DETAILS:', 'error')
      errors.slice(0, 5).forEach(error => addLog(`  • ${error}`, 'error'))
      if (errors.length > 5) {
        addLog(`  ... and ${errors.length - 5} more errors`, 'error')
      }
    }
    
    if (successCount > 0) {
      addLog('', 'success')
      addLog('🎉 Import completed!', 'success')
      addLog('🔗 Visit your test page to see the imported temples:', 'success')
      addLog('https://your-app.vercel.app/test-connection', 'success')
      addLog('', 'success')
      addLog('🏠 Your temples are now live on your website!', 'success')
    }
  }

  // Helper function to generate URL-friendly slugs
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Helper function to add log entries
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    console.log(`[${type}] ${message}`) // Debug log
    
    const log = document.getElementById('importLog')
    if (!log) {
      console.error('Import log element not found!')
      return
    }
    
    const entry = document.createElement('div')
    entry.style.margin = '2px 0'
    entry.style.padding = '2px 0'
    
    // Add colors based on type
    const colors = {
      info: '#e2e8f0',
      success: '#68d391', 
      warning: '#f6e05e',
      error: '#fc8181'
    }
    entry.style.color = colors[type]
    
    // Add timestamp for non-empty messages
    const timestamp = message.trim() ? `${new Date().toLocaleTimeString()} - ` : ''
    entry.textContent = `${timestamp}${message}`
    
    log.appendChild(entry)
    log.scrollTop = log.scrollHeight
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
                    onClick={importToSupabase}
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

                {/* Import Log Container */}
                <div id="logContainer" style={{ 
                  background: '#2d3748', 
                  color: '#e2e8f0', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  margin: '20px 0', 
                  fontFamily: 'Courier New, monospace', 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  display: 'none' 
                }}>
                  <div id="importLog"></div>
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
