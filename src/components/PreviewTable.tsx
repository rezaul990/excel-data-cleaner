import './PreviewTable.css'

interface PreviewTableProps {
  data: Record<string, any>[]
}

function PreviewTable({ data }: PreviewTableProps) {
  if (!data || data.length === 0) return null

  const headers = Object.keys(data[0])

  return (
    <div className="preview-container">
      <h3 className="preview-title">Data Preview</h3>
      <div className="table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>{row[header] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PreviewTable
