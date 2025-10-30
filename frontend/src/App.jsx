import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import SessionPage from './pages/SessionPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/session/:uniqueId" element={<SessionPage />} />
      </Routes>
    </Router>
  )
}

export default App
