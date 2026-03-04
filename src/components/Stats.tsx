import './Stats.css'

interface StatsProps {
  totalRows: number
  previewRows: number
  cleanerType: string
}

function Stats({ totalRows, previewRows, cleanerType }: StatsProps) {
  const getCleanerName = (type: string): string => {
    const names: Record<string, string> = {
      'overdue': 'Account Wise Overdue',
      'receivable': 'Plaza Account Receivable (Division)',
      'achievement': '9 Criteria - Plaza Ranking',
      'hiretarget': 'Collection Target vs Achievement (AC Wise)',
      'salesbreakdown': 'Sales Breakdown Report',
      'customerjorip': 'Customer Jorip Entry'
    }
    return names[type] || type
  }

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-label">Total Rows</div>
          <div className="stat-value">{totalRows.toLocaleString()}</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">👁️</div>
        <div className="stat-content">
          <div className="stat-label">Preview Rows</div>
          <div className="stat-value">{previewRows}</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🔧</div>
        <div className="stat-content">
          <div className="stat-label">Cleaner Type</div>
          <div className="stat-value">{getCleanerName(cleanerType)}</div>
        </div>
      </div>
    </div>
  )
}

export default Stats
