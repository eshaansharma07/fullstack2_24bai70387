import React from 'react';
import { Play, Lock, BookOpen, Layers, CheckCircle2, Award } from 'lucide-react';

export default function Dashboard({ setCurrentTab }) {
  const stats = [
    { label: 'Subject', value: 'Full Stack', icon: BookOpen },
    { label: 'Current Phase', value: 'Exp 1/4', icon: Layers },
    { label: 'System Validation', value: 'Active', icon: CheckCircle2 },
    { label: 'Target Score', value: '100%', icon: Award },
  ];

  const cards = [
    {
      id: 'exp1',
      num: 'Experiment 1',
      title: 'Multi-Platform Post Composer',
      desc: 'Design and develop a dynamic post composer interface supporting multiple platforms (X/Twitter, Facebook, Instagram, LinkedIn) with constraint validation and live previews.',
      locked: false,
    },
    {
      id: 'exp2',
      num: 'Experiment 2',
      title: 'API Integration & Persistence',
      desc: 'Establish database connections, build robust CRUD REST APIs, handle advanced schema designs and test data propagation.',
      locked: true,
    },
    {
      id: 'exp3',
      num: 'Experiment 3',
      title: 'Dynamic Live Feeds',
      desc: 'Build real-time websocket connections to sync posts across client instances, showing instant updates and live user notification triggers.',
      locked: true,
    },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Full Stack Experiments Workspace</h1>
          <p>Deploying incremental updates for each curriculum experiment module.</p>
        </div>
      </div>

      <div className="quick-stats">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{stat.value}</span>
                <span className="stat-lbl">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Curriculum Roadmap</h2>
      
      <div className="experiment-grid">
        {cards.map((card) => (
          <div key={card.id} className={`experiment-card ${card.locked ? 'locked' : ''}`}>
            <div>
              <span className="exp-badge">
                {card.locked ? 'Locked' : 'Active Module'}
              </span>
              <h3 className="exp-title">{card.title}</h3>
              <p className="exp-desc">{card.desc}</p>
            </div>
            
            {card.locked ? (
              <button className="exp-action btn-locked" disabled>
                <Lock size={16} /> Module Locked
              </button>
            ) : (
              <button className="exp-action btn-primary" onClick={() => setCurrentTab(card.id)}>
                <Play size={16} /> Launch Experiment
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
