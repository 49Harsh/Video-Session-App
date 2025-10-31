import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ScreenSharePlayer from '../components/ScreenSharePlayer'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

function SessionPage() {
  const { uniqueId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agoraToken, setAgoraToken] = useState(null)
  const [appId, setAppId] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Get session details
        const sessionResponse = await axios.get(`${API_URL}/sessions/${uniqueId}`)
        
        if (sessionResponse.data.success) {
          const sessionData = sessionResponse.data.session
          setSession(sessionData)
          
          // Get Agora token for viewer
          const tokenResponse = await axios.post(`${API_URL}/sessions/token`, {
            channelName: sessionData.agoraChannelName,
            role: 'viewer'
          })
          
          setAgoraToken(tokenResponse.data.token)
          setAppId(tokenResponse.data.appId)
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Session not found')
        console.error('Error fetching session:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [uniqueId])

  if (loading) {
    return (
      <div className="container">
        <h1>Loading session...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h1>Error</h1>
        <p className="error">{error}</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Screen Sharing Session - Viewer</h1>
      <div className="session-info">
        <p><strong>Session ID:</strong> {session.unique_id}</p>
        <p><strong>Status:</strong> <span className="status-active">🟢 Active</span></p>
      </div>
      
      {agoraToken && appId && (
        <ScreenSharePlayer
          channelName={session.agoraChannelName}
          role="viewer"
          appId={appId}
          token={agoraToken}
        />
      )}
    </div>
  )
}

export default SessionPage
