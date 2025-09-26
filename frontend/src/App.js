import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import AdminPage from './components/AdminPage';
import Navigation from './components/Navigation';

function App() {
  const [currentView, setCurrentView] = useState('search');

  return (
    <Router>
      <div className="App">
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;