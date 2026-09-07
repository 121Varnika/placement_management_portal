import React from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award,
  ArrowRight,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import MonthlyCalendar from './MonthlyCalendar';

export default function DashboardView({ 
  data, 
  onSelectCompany, 
  onNavigateToCompanies, 
  onNavigateToStudents 
}) {
  const { metrics, departmentStats, calendarEvents, recentCompanies } = data || {};

  return (
    <div>
      {/* Top Banner / Welcome */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Dashboard</h1>
          <p className="page-desc">
            Campus placement metrics, active selection rounds, and recruitment calendar.
          </p>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="metrics-grid">
        {/* Total Companies */}
        <div className="metric-card" onClick={onNavigateToCompanies} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-label">Total Companies</span>
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div className="metric-val">{metrics?.totalCompanies || 0}</div>
          <div className="metric-footer">
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
              {metrics?.completedCompanies || 0} completed
            </span>
            <span>•</span>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
              {metrics?.inProcessCompanies || 0} in process
            </span>
          </div>
        </div>

        {/* Total Students */}
        <div className="metric-card" onClick={onNavigateToStudents} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-label">Total Students</span>
            <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="metric-val">{metrics?.totalStudents || 0}</div>
          <div className="metric-footer">
            <span>Enrolled 2022-2026 Batch</span>
          </div>
        </div>

        {/* Students Placed */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Students Placed</span>
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-val" style={{ color: 'var(--success)' }}>
            {metrics?.placedStudents || 0}
          </div>
          <div className="metric-footer">
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>
              {metrics?.placementRate || 0}%
            </span>
            <span>Overall Placement Rate</span>
          </div>
        </div>

        {/* Currently In Process */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">In Selection Process</span>
            <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-val" style={{ color: 'var(--warning)' }}>
            {metrics?.inProcessStudents || 0}
          </div>
          <div className="metric-footer">
            <span>Actively interviewing across drives</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Placement Calendar & Placement Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Left: Monthly Placement Calendar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Monthly Placement Calendar
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Click date to view scheduled rounds
            </span>
          </div>
          <MonthlyCalendar 
            events={calendarEvents || []} 
            onSelectCompany={onSelectCompany} 
          />
        </div>

        {/* Right: Department-wise Statistics & Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Department Placement Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                Department Placement Statistics
              </h3>
              <TrendingUp size={16} color="var(--primary)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(departmentStats || []).map((dept) => (
                <div key={dept.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {dept.name}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {dept.placed}/{dept.total} ({dept.rate}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${dept.rate}%`, 
                        background: dept.rate >= 60 ? 'var(--success)' : 'var(--primary)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drive Status Summary Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                Recruitment Drive Pipeline
              </h3>
              <Briefcase size={16} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ padding: '12px 8px', background: 'var(--info-bg)', borderRadius: '8px', border: '1px solid var(--info-border)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--info)' }}>
                  {metrics?.notifiedCompanies || 0}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--info)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Notified
                </div>
              </div>

              <div style={{ padding: '12px 8px', background: 'var(--warning-bg)', borderRadius: '8px', border: '1px solid var(--warning-border)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {metrics?.inProcessCompanies || 0}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', marginTop: '2px' }}>
                  In Process
                </div>
              </div>

              <div style={{ padding: '12px 8px', background: 'var(--success-bg)', borderRadius: '8px', border: '1px solid var(--success-border)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>
                  {metrics?.completedCompanies || 0}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Recruitment Drives Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Recruitment Drives</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Latest companies visiting campus and their current recruitment phase
            </p>
          </div>
          <button onClick={onNavigateToCompanies} className="btn btn-secondary btn-sm">
            <span>View All Companies</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Package</th>
                <th>Opportunity Type</th>
                <th>Notified Date</th>
                <th>Work Policy</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(recentCompanies || []).map((company) => (
                <tr key={company.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{company.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {company.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-package">{company.salary_package}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {company.opportunity_type}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {company.notified_date}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {company.wfh_info || 'Standard'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      company.status === 'Completed' ? 'badge-completed' :
                      company.status === 'In Process' ? 'badge-in-process' : 'badge-notified'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => onSelectCompany(company.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>Track Candidates</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
