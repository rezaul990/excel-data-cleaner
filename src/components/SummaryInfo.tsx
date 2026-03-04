import './SummaryInfo.css'

interface SummaryInfoProps {
  cleanerType: string
}

function SummaryInfo({ cleanerType }: SummaryInfoProps) {
  if (cleanerType !== 'customerjorip') return null

  return (
    <div className="summary-info">
      <div className="summary-icon">📊</div>
      <div className="summary-content">
        <h4>Summary Included</h4>
        <p>Your download will include a summary sheet with Area & Plaza-wise Jorip Entry Qty pivoted by Survey Category (with area subtotals)</p>
      </div>
    </div>
  )
}

export default SummaryInfo
