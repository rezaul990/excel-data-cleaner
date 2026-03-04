import './LoadingSpinner.css'

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Processing your file...</p>
    </div>
  )
}

export default LoadingSpinner
