import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import PuzzlePage from './pages/PuzzlePage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router basename="/puzzlekids">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/puzzle/:id" element={<PuzzlePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;