import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TrainPage from './pages/TrainPage';
import TransformPage from './pages/TransformPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/train" element={<TrainPage />} />
          <Route path="/transform" element={<TransformPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
