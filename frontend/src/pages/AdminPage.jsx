import { useState } from 'react'
import axios from 'axios'
import VideoPlayer from '../components/VideoPlayer'

const API_URL = 'http://localhost:5000/api'

function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const startSession = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_URL}/sessions`)
      
      if (response.data.success) {
        setSession(response.data.session)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(session.userurl)
    alert('Session URL copied to clipboard!')
  }

  return (
    <div className="container">
      <h1>Live Video Session - Admin</h1>
      
      {!session ? (
        <div className="start-section">
          <button 
            className="start-button" 
            onClick={startSession}
            disabled={loading}
          >
            {loading ? 'Creating Session...' : 'START SESSION'}
          </button>
          
          {error && <p className="error">{error}</p>}
        </div>
      ) : (
        <div className="session-container">
          <div className="session-info">
            <h2>Session Created!</h2>
            <p><strong>Session ID:</strong> {session.unique_id}</p>
            <div className="url-container">
              <p><strong>Share this URL with students:</strong></p>
              <input 
                type="text" 
                value={session.userurl} 
                readOnly 
                className="url-input"
              />
              <button onClick={copyToClipboard} className="copy-button">
                Copy URL
              </button>
            </div>
          </div>
          
          <VideoPlayer />
        </div>
      )}
    </div>
  )
}

export default AdminPage
