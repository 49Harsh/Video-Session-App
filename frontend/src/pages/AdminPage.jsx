import { useState } from 'react'
import axios from 'axios'
import ScreenSharePlayer from '../components/ScreenSharePlayer'

const API_URL = 'http://localhost:5000/api'

function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [agoraToken, setAgoraToken] = useState(null)
  const [appId, setAppId] = useState(null)

  const startSession = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Create session on backend
      const sessionResponse = await axios.post(`${API_URL}/sessions`)
      
      if (sessionResponse.data.success) {
        const sessionData = sessionResponse.data.session
        setSession(sessionData)
        
        // Get Agora token
        const tokenResponse = await axios.post(`${API_URL}/sessions/token`, {
          channelName: sessionData.agoraChannelName,
          role: 'host'
        })
        
        setAgoraToken(tokenResponse.data.token)
        setAppId(tokenResponse.data.appId)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session')
      console.error('Error starting session:', err)
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
      <h1>Screen Sharing Platform - Host</h1>
      
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
            <h2>Session Created! 🎉</h2>
            <p><strong>Session ID:</strong> {session.unique_id}</p>
            <div className="url-container">
              <p><strong>Share this URL with viewers:</strong></p>
              <input 
                type="text" 
                value={session.userurl} 
                readOnly 
                className="url-input"
              />
              <button onClick={copyToClipboard} className="copy-button">
                📋 Copy URL
              </button>
            </div>
          </div>
          
          {agoraToken && appId && (
            <ScreenSharePlayer
              channelName={session.agoraChannelName}
              role="host"
              appId={appId}
              token={agoraToken}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPage
