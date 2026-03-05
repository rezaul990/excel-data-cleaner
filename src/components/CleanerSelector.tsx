import './CleanerSelector.css'

interface CleanerSelectorProps {
  value: string
  onChange: (value: string) => void
}

function CleanerSelector({ value, onChange }: CleanerSelectorProps) {
  const cleaners = [
    { value: 'overdue', label: 'Account Wise Overdue Cleaner', icon: '📊' },
    { value: 'receivable', label: 'Plaza Account Receivable (Division) Cleaner', icon: '💰' },
    { value: 'achievement', label: '9 Criteria - Plaza Ranking Cleaner', icon: '🏆' },
    { value: 'hiretarget', label: 'Collection Target vs Achievement (AC Wise) Cleaner', icon: '🎯' },
    { value: 'salesbreakdown', label: 'Sales Breakdown Report Cleaner', icon: '📈' },
    { value: 'customerjorip', label: 'Customer Jorip Entry Cleaner', icon: '👥' },
    { value: 'mobilecollection', label: 'Mobile Collection Report Cleaner', icon: '📱' }
  ]

  return (
    <div className="cleaner-selector">
      <label className="selector-label">Select Cleaner Type</label>
      <div className="selector-grid">
        {cleaners.map((cleaner) => (
          <button
            key={cleaner.value}
            className={`selector-card ${value === cleaner.value ? 'active' : ''}`}
            onClick={() => onChange(cleaner.value)}
          >
            <span className="card-icon">{cleaner.icon}</span>
            <span className="card-label">{cleaner.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CleanerSelector
