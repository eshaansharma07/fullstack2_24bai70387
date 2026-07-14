import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/ExperimentHub/Dashboard';
import Composer from './components/PostComposer/Composer';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main workspace content viewport */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <Dashboard setCurrentTab={setCurrentTab} />
        )}
        {currentTab === 'exp1' && (
          <Composer />
        )}
      </main>
    </div>
  );
}
