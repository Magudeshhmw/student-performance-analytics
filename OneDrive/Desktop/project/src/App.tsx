import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudentDetails from './pages/StudentDetails';
import Analytics from './pages/Analytics';
import FileManager from './pages/FileManager';
import Predictions from './pages/Predictions';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students/:studentId" element={<StudentDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/files" element={<FileManager />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;