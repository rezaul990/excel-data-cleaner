import { useState } from 'react'
import * as XLSX from 'xlsx'
import './App.css'
import FileUpload from './components/FileUpload'
import CleanerSelector from './components/CleanerSelector'
import PreviewTable from './components/PreviewTable'
import DownloadButton from './components/DownloadButton'
import Modal from './components/Modal'
import LoadingSpinner from './components/LoadingSpinner'
import Stats from './components/Stats'
import SummaryInfo from './components/SummaryInfo'
import SummaryTable from './components/SummaryTable'

function App() {
  const [cleanedData, setCleanedData] = useState<Record<string, any>[] | null>(null)
  const [summaryData, setSummaryData] = useState<Record<string, any>[] | null>(null)
  const [filename, setFilename] = useState('')
  const [cleanerType, setCleanerType] = useState('overdue')
  const [status, setStatus] = useState('')
  const [rawRows, setRawRows] = useState<any[][] | null>(null)
  const [isAutoDetected, setIsAutoDetected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'success' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  })

  const detectCleanerType = (rows: any[][]): string | null => {
    if (rows.length < 6) return null
    
    const headerRow = rows[5]
    const dataRow = rows[6]
    
    if (!headerRow || !dataRow) return null
    
    const headers = headerRow.map((h: any) => String(h || '').toLowerCase().trim())
    
    // Check for Customer Jorip Entry (has specific columns at row 6)
    if (rows.length > 6) {
      const joripHeaderRow = rows[6]
      if (joripHeaderRow) {
        const joripHeaders = joripHeaderRow.map((h: any) => String(h || '').toLowerCase().trim())
        const hasJoripPattern = joripHeaders.includes('survery catetory') && 
                                 joripHeaders.includes('customer mob. number') &&
                                 joripHeaders.includes('survey entry date')
        if (hasJoripPattern) {
          return 'customerjorip'
        }
      }
    }
    
    // Check for Sales Breakdown Report (starts at row 8, has Plaza Name column)
    if (rows.length > 8) {
      const salesHeaderRow = rows[8]
      if (salesHeaderRow) {
        const salesHeaders = salesHeaderRow.map((h: any) => String(h || '').toLowerCase().trim())
        const hasSalesPattern = salesHeaders.includes('plaza name') && 
                                 salesHeaders.includes('cash sale') &&
                                 salesHeaders.includes('hire sale')
        if (hasSalesPattern) {
          return 'salesbreakdown'
        }
      }
    }
    
    // Check for Achievement Report (has two header rows)
    const nextRow = rows[6]
    const hasDoubleHeader = nextRow && nextRow.some((cell: any) => 
      String(cell || '').toLowerCase().includes('target') || 
      String(cell || '').toLowerCase().includes('achieve')
    )
    if (hasDoubleHeader && headers.some(h => h.includes('division'))) {
      return 'achievement'
    }
    
    // Check for Hire Target (has specific columns to remove)
    const hasHireTargetPattern = headers.includes('account no.') && 
                                  headers.includes('customer name') && 
                                  headers.includes('assign person id')
    if (hasHireTargetPattern) {
      return 'hiretarget'
    }
    
    // Check for AR Receivable (has Area column and specific structure)
    const hasAreaColumn = headers.some(h => h === 'area' || h === 'area ')
    
    // Check if it looks like AR Receivable by checking for specific columns
    const hasReceivablePattern = hasAreaColumn && 
                                  headers.includes('plaza name') &&
                                  headers.includes('code')
    
    if (hasReceivablePattern) {
      return 'receivable'
    }
    
    // Check for Overdue Accounts (has Area column but different structure)
    if (hasAreaColumn && headers.includes('s / n')) {
      return 'overdue'
    }
    
    return null
  }

  const handleFileUpload = (file: File) => {
    setIsLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      setTimeout(() => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][]
        
        // Auto-detect cleaner type
        const detectedType = detectCleanerType(rows)
        
        setRawRows(rows)
        
        if (detectedType) {
          setCleanerType(detectedType)
          setIsAutoDetected(true)
          setStatus(`✨ Auto-detected: ${getCleanerName(detectedType)}`)
          processData(rows, detectedType)
        } else {
          setRawRows(rows)
          setIsAutoDetected(false)
          setStatus('⚠️ Could not auto-detect file type. Please select cleaner manually and click Process.')
          setCleanedData(null)
        }
        setIsLoading(false)
      }, 500)
    }
    
    reader.readAsArrayBuffer(file)
  }

  const getCleanerName = (type: string): string => {
    const names: Record<string, string> = {
      'overdue': 'Account Wise Overdue Cleaner',
      'receivable': 'Plaza Account Receivable (Division) Cleaner',
      'achievement': '9 Criteria - Plaza Ranking Cleaner',
      'hiretarget': 'Collection Target vs Achievement (AC Wise) Cleaner',
      'salesbreakdown': 'Sales Breakdown Report Cleaner',
      'customerjorip': 'Customer Jorip Entry Cleaner'
    }
    return names[type] || type
  }

  const processData = (rows: any[][], type: string) => {
    let result: Record<string, any>[] = []
    let fname = ''

    try {
      switch(type) {
        case 'overdue':
          result = cleanOverdue(rows)
          fname = 'cleaned_overdue.xlsx'
          break
        case 'receivable':
          result = cleanReceivable(rows)
          fname = 'cleaned_receivable.xlsx'
          break
        case 'achievement':
          result = cleanAchievement(rows)
          fname = 'cleaned_achievement.xlsx'
          break
        case 'hiretarget':
          result = cleanHireTarget(rows)
          fname = 'cleaned_hiretarget.xlsx'
          break
        case 'salesbreakdown':
          result = cleanSalesBreakdown(rows)
          fname = 'cleaned_salesbreakdown.xlsx'
          break
        case 'customerjorip':
          result = cleanCustomerJorip(rows)
          fname = 'cleaned_customerjorip.xlsx'
          break
        default:
          result = []
      }

      if (result.length === 0) {
        setModal({
          isOpen: true,
          title: 'No Data Found',
          message: 'আপনার Upload করা File এর Cleaner Available নেই। Developer এর সাথে যোগাযোগ করুন।\n\nAvailable Cleaners:\n• Account Wise Overdue Cleaner\n• Plaza Account Receivable (Division) Cleaner\n• 9 Criteria - Plaza Ranking Cleaner\n• Collection Target vs Achievement (AC Wise) Cleaner\n• Sales Breakdown Report Cleaner\n• Customer Jorip Entry Cleaner',
          type: 'error'
        })
        setStatus('⚠️ Could not auto-detect file type. Please select cleaner manually and click Process.')
        setCleanedData(null)
        return
      }

      setCleanedData(result)
      setFilename(fname)
      setStatus(`✅ Successfully processed ${result.length} rows`)
      
      // Generate summary for Customer Jorip Entry
      if (type === 'customerjorip') {
        const summary = generateJoripSummary(result)
        setSummaryData(summary)
      } else {
        setSummaryData(null)
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: 'Processing Error',
        message: 'আপনার Upload করা File এর Cleaner Available নেই। Developer এর সাথে যোগাযোগ করুন।\n\nAvailable Cleaners:\n• Account Wise Overdue Cleaner\n• Plaza Account Receivable (Division) Cleaner\n• 9 Criteria - Plaza Ranking Cleaner\n• Collection Target vs Achievement (AC Wise) Cleaner\n• Sales Breakdown Report Cleaner\n• Customer Jorip Entry Cleaner',
        type: 'error'
      })
      setStatus('⚠️ Could not auto-detect file type. Please select cleaner manually and click Process.')
      setCleanedData(null)
      console.error('Processing error:', error)
    }
  }

  const cleanOverdue = (rows: any[][]) => {
    rows = rows.slice(5)
    const headers = rows[0]
    rows = rows.slice(1)

    let dataset = rows.map(r => {
      const obj: Record<string, any> = {}
      headers.forEach((h: any, i: number) => obj[h] = r[i])
      return obj
    })

    return dataset.filter(r => {
      const area = String(r['Area'] || '').trim()
      return area !== '' && area !== 'Area'
    })
  }

  const cleanReceivable = (rows: any[][]) => {
    rows = rows.slice(5)
    const headers = rows[0]
    rows = rows.slice(1)

    let dataset = rows.map(r => {
      const obj: Record<string, any> = {}
      headers.forEach((h: any, i: number) => obj[h] = r[i])
      return obj
    })

    return dataset.filter(r => {
      const area = String(r['Area '] || r['Area'] || '').trim()
      return area !== '' && area !== 'Area'
    })
  }

  const cleanAchievement = (rows: any[][]) => {
    rows = rows.slice(5)
    const header1 = rows[0]
    const header2 = rows[1]

    const headers = header1.map((h: any, i: number) => {
      const sub = header2[i]
      if (sub && sub !== '') return h + ' - ' + sub
      return h
    })

    rows = rows.slice(2)

    let dataset = rows.map(r => {
      const obj: Record<string, any> = {}
      headers.forEach((h: any, i: number) => obj[h] = r[i])
      return obj
    })

    const divisionCol = headers.find((h: string) => h.toLowerCase().includes('division'))

    return dataset.filter(r => {
      const div = String(r[divisionCol] || '').trim()
      return div !== '' && div !== 'Division'
    })
  }

  const cleanHireTarget = (rows: any[][]) => {
    rows = rows.slice(5)
    const headers = rows[0]
    rows = rows.slice(1)

    let dataset = rows.map(r => {
      const obj: Record<string, any> = {}
      headers.forEach((h: any, i: number) => obj[h] = r[i])
      return obj
    })

    const columnsToRemove = ['Column2', 'Column7', 'Column10', 'Column12', 'Column14', 'Column19', 'Column21', 'Column23', 'Column24', 'Column25']

    dataset = dataset.map(row => {
      const newRow: Record<string, any> = {}
      Object.keys(row).forEach(key => {
        if (!columnsToRemove.includes(key) && !key.includes('.xls')) {
          newRow[key] = row[key]
        }
      })
      return newRow
    })

    return dataset.filter(r => {
      const area = String(r['Area'] || '').trim()
      return area !== '' && area !== 'Area'
    })
  }

  const cleanCustomerJorip = (rows: any[][]) => {
    // Skip first 6 rows
    rows = rows.slice(6)
    const headers = rows[0]
    rows = rows.slice(1)

    let dataset = rows.map(r => {
      const obj: Record<string, any> = {}
      headers.forEach((h: any, i: number) => obj[h] = r[i])
      return obj
    })

    // Remove specific columns
    const columnsToRemove = ['Column2', 'Column7', 'Column13', 'Column14', 'Column20', 'Column21', 'Column22', 'Column23']

    dataset = dataset.map(row => {
      const newRow: Record<string, any> = {}
      Object.keys(row).forEach(key => {
        if (!columnsToRemove.includes(key) && !key.includes('.xls')) {
          newRow[key] = row[key]
        }
      })
      return newRow
    })

    // Filter out invalid rows
    return dataset.filter(r => {
      const area = String(r['Area'] || '').trim()
      return area !== '' && area !== 'Area'
    })
  }

  const generateJoripSummary = (data: Record<string, any>[]) => {
    // Create pivot table: Area > Plaza wise Jorip Entry Qty by Survey Category
    const areaData: Record<string, Record<string, Record<string, number>>> = {}
    const categories = new Set<string>()

    data.forEach(row => {
      const area = String(row['Area'] || '').trim()
      const plaza = String(row['Plaza'] || '').trim()
      const category = String(row['Survery Catetory'] || '').trim()

      if (area && plaza && category) {
        categories.add(category)
        
        if (!areaData[area]) {
          areaData[area] = {}
        }
        
        if (!areaData[area][plaza]) {
          areaData[area][plaza] = {}
        }
        
        if (!areaData[area][plaza][category]) {
          areaData[area][plaza][category] = 0
        }
        
        areaData[area][plaza][category]++
      }
    })

    // Convert to array format for Excel
    const sortedCategories = Array.from(categories).sort()
    const summaryData: Record<string, any>[] = []

    Object.keys(areaData).sort().forEach(area => {
      const plazas = areaData[area]
      const areaSubtotal: Record<string, any> = { 'Area': area, 'Plaza': 'Area Subtotal' }
      let areaTotal = 0

      sortedCategories.forEach(category => {
        areaSubtotal[category] = 0
      })

      Object.keys(plazas).sort().forEach(plaza => {
        const row: Record<string, any> = { 'Area': area, 'Plaza': plaza }
        let plazaTotal = 0
        
        sortedCategories.forEach(category => {
          const count = plazas[plaza][category] || 0
          row[category] = count
          plazaTotal += count
          areaSubtotal[category] += count
          areaTotal += count
        })
        
        row['Total'] = plazaTotal
        summaryData.push(row)
      })

      areaSubtotal['Total'] = areaTotal
      summaryData.push(areaSubtotal)
    })

    // Add grand total row
    const grandTotal: Record<string, any> = { 'Area': 'Grand Total', 'Plaza': '' }
    let overallTotal = 0
    
    sortedCategories.forEach(category => {
      const categoryTotal = summaryData
        .filter(row => row['Plaza'] !== 'Area Subtotal')
        .reduce((sum, row) => sum + (row[category] || 0), 0)
      grandTotal[category] = categoryTotal
      overallTotal += categoryTotal
    })
    
    grandTotal['Total'] = overallTotal
    summaryData.push(grandTotal)

    return summaryData
  }

  const cleanSalesBreakdown = (rows: any[][]) => {
    // Skip first 8 rows
    rows = rows.slice(8)
    const headers = rows[0]
    rows = rows.slice(1)

    let dataset = rows.map(r => {
      const obj: Record<string, any> = {}
      headers.forEach((h: any, i: number) => obj[h] = r[i])
      return obj
    })

    // Remove specific columns
    const columnsToRemove = ['Column2', 'Column4', 'Column6', 'Column10', 'Column12', 'Column13', 'Column14']

    dataset = dataset.map(row => {
      const newRow: Record<string, any> = {}
      Object.keys(row).forEach(key => {
        if (!columnsToRemove.includes(key) && !key.includes('.xls')) {
          newRow[key] = row[key]
        }
      })
      return newRow
    })

    // Filter out invalid rows
    const invalidValues = [
      null,
      'Designed and developed by: Walton Group',
      'Development :',
      'Grand Total',
      'Plaza Name',
      'Sales Report',
      'Walton Plaza',
      'Zone :'
    ]

    return dataset.filter(r => {
      const plazaName = String(r['Plaza Name'] || '').trim()
      
      // Check if plaza name is invalid
      if (!plazaName || invalidValues.includes(plazaName)) {
        return false
      }
      
      // Check if plaza name starts with "For the period of"
      if (plazaName.startsWith('For the period of')) {
        return false
      }
      
      return true
    })
  }

  const handleDownload = () => {
    if (!cleanedData || cleanedData.length === 0) {
      setModal({
        isOpen: true,
        title: 'No Data',
        message: 'No data available to download.',
        type: 'warning'
      })
      return
    }

    const newBook = XLSX.utils.book_new()
    
    // Add cleaned data sheet
    const cleanedSheet = XLSX.utils.json_to_sheet(cleanedData)
    XLSX.utils.book_append_sheet(newBook, cleanedSheet, 'Cleaned Data')
    
    // Add summary sheet for Customer Jorip Entry
    if (cleanerType === 'customerjorip') {
      const summaryData = generateJoripSummary(cleanedData)
      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(newBook, summarySheet, 'Summary - Plaza Wise')
    }
    
    XLSX.writeFile(newBook, filename)
    
    const summaryMessage = cleanerType === 'customerjorip' 
      ? `Successfully downloaded ${filename} with ${cleanedData.length} rows.\n\nIncludes Summary Sheet: Area & Plaza-wise Jorip Entry Qty by Survey Category with subtotals`
      : `Successfully downloaded ${filename} with ${cleanedData.length} rows.`
    
    setModal({
      isOpen: true,
      title: 'Download Complete',
      message: summaryMessage,
      type: 'success'
    })
  }

  const handleManualProcess = () => {
    if (rawRows) {
      setIsAutoDetected(false)
      processData(rawRows, cleanerType)
    }
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <nav className="navbar">
        <div className="navbar-content">
          <a href="/" className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">Excel Data Cleaner</span>
          </a>
          <div className="nav-right">
            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <button 
              className="dark-mode-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <div className="developer-credit top">
        <span className="credit-icon">❤️</span>
        <span className="credit-text">Developed with Love by Md Rezaul Karim RCM</span>
        <span className="credit-separator">|</span>
        <a href="https://wa.me/8801712394851" target="_blank" rel="noopener noreferrer" className="top-contact-link">
          📱 WhatsApp
        </a>
        <a href="https://www.facebook.com/rezaul2000" target="_blank" rel="noopener noreferrer" className="top-contact-link">
          👤 Facebook
        </a>
      </div>

      <main className="main-content">
        <div className="content-area">
          <div className="container">
            <div className="header">
              <h1 className="title">Excel Data Cleaner</h1>
              <p className="subtitle">Upload, clean, and download your Excel files with ease. Automated detection and processing for multiple file types.</p>
            </div>
            
            <div className="controls">
              <FileUpload onFileUpload={handleFileUpload} />
              
              {rawRows && !isAutoDetected && !isLoading && (
                <>
                  <CleanerSelector value={cleanerType} onChange={setCleanerType} />
                  <button className="process-button" onClick={handleManualProcess}>
                    Process with Selected Cleaner
                  </button>
                </>
              )}
            </div>

            {isLoading && <LoadingSpinner />}

            {status && !isLoading && <p className={`status ${isAutoDetected ? 'auto-detected' : 'manual-select'}`}>{status}</p>}

            {cleanedData && cleanedData.length > 0 && !isLoading && (
              <>
                <Stats 
                  totalRows={cleanedData.length} 
                  previewRows={Math.min(50, cleanedData.length)} 
                  cleanerType={cleanerType}
                />
                <SummaryInfo cleanerType={cleanerType} />
                <DownloadButton onClick={handleDownload} />
                
                {summaryData && summaryData.length > 0 && (
                  <SummaryTable data={summaryData} />
                )}
                
                <PreviewTable data={cleanedData.slice(0, 50)} />
              </>
            )}
          </div>
        </div>

        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-icon">🔧</span>
            <h3 className="sidebar-title">Available Cleaners</h3>
          </div>
          <ul className="cleaner-list">
            <li className="cleaner-item">
              <span className="cleaner-item-icon">📊</span>
              <span className="cleaner-item-text">Account Wise Overdue Cleaner</span>
            </li>
            <li className="cleaner-item">
              <span className="cleaner-item-icon">💰</span>
              <span className="cleaner-item-text">Plaza Account Receivable (Division) Cleaner</span>
            </li>
            <li className="cleaner-item">
              <span className="cleaner-item-icon">🏆</span>
              <span className="cleaner-item-text">9 Criteria - Plaza Ranking Cleaner</span>
            </li>
            <li className="cleaner-item">
              <span className="cleaner-item-icon">🎯</span>
              <span className="cleaner-item-text">Collection Target vs Achievement (AC Wise) Cleaner</span>
            </li>
            <li className="cleaner-item">
              <span className="cleaner-item-icon">📈</span>
              <span className="cleaner-item-text">Sales Breakdown Report Cleaner</span>
            </li>
            <li className="cleaner-item">
              <span className="cleaner-item-icon">👥</span>
              <span className="cleaner-item-text">Customer Jorip Entry Cleaner</span>
            </li>
          </ul>
          <div className="sidebar-footer">
            <p className="sidebar-footer-text">
              Upload your file and the system will automatically detect the appropriate cleaner
            </p>
          </div>
          <div className="sidebar-contact">
            <div className="sidebar-contact-header">
              <span className="sidebar-contact-icon">💡</span>
              <h4 className="sidebar-contact-title">Need More Cleaners?</h4>
            </div>
            <p className="sidebar-contact-text">Contact the developer to add custom cleaners for your specific needs</p>
            <div className="sidebar-contact-buttons">
              <a href="https://wa.me/8801712394851" target="_blank" rel="noopener noreferrer" className="sidebar-contact-btn whatsapp">
                <span className="btn-icon">📱</span>
                <span className="btn-text">WhatsApp</span>
              </a>
              <a href="https://www.facebook.com/rezaul2000" target="_blank" rel="noopener noreferrer" className="sidebar-contact-btn facebook">
                <span className="btn-icon">👤</span>
                <span className="btn-text">Facebook</span>
              </a>
            </div>
          </div>
        </aside>
      </main>

      <footer className="footer">
        <div className="developer-credit bottom">
          <span className="credit-icon">❤️</span>
          <span className="credit-text">Developed with Love by Md Rezaul Karim RCM</span>
        </div>
        
        <div className="footer-content">
          <div className="footer-section">
            <h3>About</h3>
            <p>Excel Data Cleaner is a powerful tool designed to automate the cleaning and processing of Excel files with intelligent detection capabilities.</p>
            <div className="social-links">
              <div className="social-icon">📧</div>
              <div className="social-icon">💼</div>
              <div className="social-icon">🐦</div>
            </div>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Available Cleaners</h3>
            <ul>
              <li>Account Wise Overdue</li>
              <li>Plaza Account Receivable</li>
              <li>9 Criteria - Plaza Ranking</li>
              <li>Collection Target vs Achievement</li>
              <li>Sales Breakdown Report</li>
              <li>Customer Jorip Entry</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: support@exceldatacleaner.com</p>
            <p>Phone: +880 1234-567890</p>
            <p>Address: Dhaka, Bangladesh</p>
            <div className="developer-contact">
              <h4>Developer Contact</h4>
              <p>
                <a href="https://wa.me/8801712394851" target="_blank" rel="noopener noreferrer" className="contact-link whatsapp">
                  <span className="contact-icon">📱</span> WhatsApp: +880 1712-394851
                </a>
              </p>
              <p>
                <a href="https://www.facebook.com/rezaul2000" target="_blank" rel="noopener noreferrer" className="contact-link facebook">
                  <span className="contact-icon">👤</span> Facebook: rezaul2000
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Excel Data Cleaner. All rights reserved. | Designed with ❤️ for data professionals</p>
        </div>
      </footer>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

export default App
