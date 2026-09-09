import React from 'react';
import { Search, Plus, Building2, UserPlus, Sparkles } from 'lucide-react';
import { isDemoMode } from '../lib/supabase';

export default function Header({ searchQuery, setSearchQuery, onAddCompany, onAddStudent }) {
  const demo = isDemoMode();

  return (
    <header className="top-header">
      {/* Search Input */}
      <div className="header-search">
        <Search className="header-search-icon" size={16} />
        <input
          type="text"
          placeholder="Search students, companies, roll numbers, or packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Action Buttons & Profile */}
      <div className="header-actions">
        {demo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '20px',
            color: '#60a5fa',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <Sparkles size={13} />
            <span>Demo Mode</span>
          </div>
        )}

        <button 
          onClick={onAddCompany}
          className="btn btn-secondary btn-sm"
          title="Add New Recruitment Company"
        >
          <Building2 size={15} />
          <span>New Company</span>
        </button>

        <button 
          onClick={onAddStudent}
          className="btn btn-primary btn-sm"
          title="Register New Student"
        >
          <UserPlus size={15} />
          <span>New Student</span>
        </button>

        {/* Mentor Profile */}
        <div className="mentor-profile">
          <div className="mentor-avatar">M</div>
          <div className="mentor-info">
            <div className="mentor-name">Placement Officer</div>
            <div className="mentor-role">{demo ? 'Demo Preview' : 'Mentor Portal'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

