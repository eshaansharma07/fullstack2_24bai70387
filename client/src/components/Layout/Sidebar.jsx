import React from 'react';
import { LayoutDashboard, PenTool, Database, Lock, Settings, BarChart2 } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null, locked: false },
    { id: 'exp1', name: 'Exp 1: Post Composer', icon: PenTool, badge: 'Active', locked: false },
    { id: 'exp2', name: 'Exp 2: API Integration', icon: Database, badge: 'Locked', locked: true },
    { id: 'exp3', name: 'Exp 3: Dynamic Feeds', icon: BarChart2, badge: 'Locked', locked: true },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">S</div>
        <span className="logo-text">DevSuite</span>
      </div>

      <nav className="nav-menu">
        <span className="nav-title">Experiments Hub</span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''} ${item.locked ? 'locked' : ''}`}
              onClick={() => !item.locked && setCurrentTab(item.id)}
              style={item.locked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <Icon size={18} />
              <span>{item.name}</span>
              {item.badge && (
                <span className={`nav-badge ${item.locked ? 'beta' : ''}`}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">U</div>
        <div className="user-info">
          <span className="username">Academic User</span>
          <span className="user-role">Full Stack Developer</span>
        </div>
      </div>
    </div>
  );
}
