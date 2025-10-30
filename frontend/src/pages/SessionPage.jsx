import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import VideoPlayer from '../components/VideoPlayer'

const API_URL = 'http://localhost:5000/api'

function SessionPage() {
  const { uniqueId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${API_URL}/sessions/${uniqueId}`)
        
        if (response.data.success) {
          setSession(response.data.session)
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Session not found')
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
      <h1>Live Video Session - Student View</h1>
      <div className="session-info">
        <p><strong>Session ID:</strong> {session.unique_id}</p>
        <p><strong>Status:</strong> <span className="status-active">Active</span></p>
      </div>
      
      <VideoPlayer />
    </div>
  )
}

export default SessionPage
