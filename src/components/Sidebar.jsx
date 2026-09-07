import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Calendar, 
  FolderSymlink,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats, user, onSignOut }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2, count: stats?.totalCompanies },
    { id: 'students', label: 'Students', icon: GraduationCap, count: stats?.totalStudents },
    { id: 'calendar', label: 'Placement Calendar', icon: Calendar },
    { id: 'drive_links', label: 'Drive Links', icon: FolderSymlink, count: stats?.totalDriveLinks }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <GraduationCap size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">PMP Portal</div>
          <div className="brand-subtitle">Placement Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-label">Core Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              <span>{item.label}</span>
              {item.count !== undefined && item.count !== null && (
                <span className="badge-count">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Authenticated User & Sign Out Footer */}
      <div className="sidebar-footer">
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }}></span>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.email || 'Authorized Mentor'}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Cybersecurity & IoT Placement Cell
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out of the Placement Management Portal?')) {
                onSignOut();
              }
            }}
            className="btn-icon-only"
            title="Sign Out"
            style={{
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px',
              padding: '6px'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
