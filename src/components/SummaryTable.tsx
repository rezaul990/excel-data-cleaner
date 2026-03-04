import { useState } from 'react'
import './SummaryTable.css'

interface SummaryTableProps {
  data: Record<string, any>[]
}

function SummaryTable({ data }: SummaryTableProps) {
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedPlaza, setSelectedPlaza] = useState<string>('all')

  if (!data || data.length === 0) return null

  // Get unique areas and plazas
  const areas = Array.from(new Set(data
    .filter(row => row['Area'] !== 'Grand Total' && row['Plaza'] !== 'Area Subtotal')
    .map(row => row['Area'])))
    .sort()

  const plazas = Array.from(new Set(data
    .filter(row => row['Area'] !== 'Grand Total' && row['Plaza'] !== 'Area Subtotal')
    .filter(row => selectedArea === 'all' || row['Area'] === selectedArea)
    .map(row => row['Plaza'])))
    .sort()

  // Filter data based on selections
  const filteredData = data.filter(row => {
    // Always show grand total
    if (row['Area'] === 'Grand Total') return true

    // Filter by area
    if (selectedArea !== 'all' && row['Area'] !== selectedArea) return false

    // Show area subtotal if area matches
    if (row['Plaza'] === 'Area Subtotal') return true

    // Filter by plaza
    if (selectedPlaza !== 'all' && row['Plaza'] !== selectedPlaza) return false

    return true
  })

  const headers = Object.keys(data[0])

  const getRowClass = (row: Record<string, any>) => {
    if (row['Area'] === 'Grand Total') return 'grand-total-row'
    if (row['Plaza'] === 'Area Subtotal') return 'subtotal-row'
    return ''
  }

  return (
    <div className="summary-section">
      <div className="summary-header">
        <span className="summary-header-icon">📊</span>
        <h3>Summary Report - Plaza Wise Jorip Entry by Survey Category</h3>
      </div>

      <div className="summary-filters">
        <div className="filter-group">
          <label htmlFor="area-filter">Filter by Area:</label>
          <select 
            id="area-filter"
            value={selectedArea} 
            onChange={(e) => {
              setSelectedArea(e.target.value)
              setSelectedPlaza('all')
            }}
            className="filter-select"
          >
            <option value="all">All Areas</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="plaza-filter">Filter by Plaza:</label>
          <select 
            id="plaza-filter"
            value={selectedPlaza} 
            onChange={(e) => setSelectedPlaza(e.target.value)}
            className="filter-select"
            disabled={selectedArea === 'all'}
          >
            <option value="all">All Plazas</option>
            {plazas.map(plaza => (
              <option key={plaza} value={plaza}>{plaza}</option>
            ))}
          </select>
        </div>

        {(selectedArea !== 'all' || selectedPlaza !== 'all') && (
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSelectedArea('all')
              setSelectedPlaza('all')
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="summary-table-wrapper">
        <table className="summary-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className={getRowClass(row)}>
                {headers.map((header, colIndex) => (
                  <td 
                    key={colIndex}
                    className={header === 'Area' && row[header] !== 'Grand Total' ? 'area-cell' : ''}
                  >
                    {row[header] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SummaryTable
