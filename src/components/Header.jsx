import React from 'react';
import { Search, Plus, Building2, UserPlus } from 'lucide-react';

export default function Header({ searchQuery, setSearchQuery, onAddCompany, onAddStudent }) {
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
            <div className="mentor-role">Mentor Portal</div>
          </div>
        </div>
      </div>
    </header>
  );
}
