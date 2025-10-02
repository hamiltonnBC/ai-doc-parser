import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from '@pages/Dashboard'
import DocumentDetail from '@pages/DocumentDetail'
import CaseView from '@pages/CaseView'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/case/:caseId" element={<CaseView />} />
        <Route path="/document/:documentId" element={<DocumentDetail />} />
      </Routes>
    </Router>
  )
}

export default App
