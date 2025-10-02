import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from '@pages/Dashboard'
import DocumentDetail from '@pages/DocumentDetail'
import CaseView from '@pages/CaseView'
import ChatHistory from '@pages/ChatHistory'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/case/:caseId" element={<CaseView />} />
        <Route path="/document/:documentId" element={<DocumentDetail />} />
        <Route path="/chat-history/:caseId" element={<ChatHistory />} />
      </Routes>
    </Router>
  )
}

export default App
