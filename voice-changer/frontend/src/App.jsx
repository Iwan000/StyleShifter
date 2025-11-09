import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import TrainPage from './pages/TrainPage';
import TransformPage from './pages/TransformPage';
import ChatPage from './pages/ChatPage';

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/chat';

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/train" element={<TrainPage />} />
        <Route path="/transform" element={<TransformPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
