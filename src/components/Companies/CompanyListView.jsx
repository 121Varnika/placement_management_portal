import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronRight,
  Briefcase,
  Clock,
  Home
} from 'lucide-react';

export default function CompanyListView({ 
  companies = [], 
  onAddCompany, 
  onEditCompany, 
  onDeleteCompany, 
  onSelectCompany 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [driveTypeFilter, setDriveTypeFilter] = useState('ALL');

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.salary_package && company.salary_package.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || company.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || company.opportunity_type === typeFilter;
    const matchesDriveType = driveTypeFilter === 'ALL' || (company.drive_type || 'On Campus') === driveTypeFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDriveType;
  });

  return (
    <div>
      {/* Header Bar */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Management</h1>
          <p className="page-desc">
            Manage recruiting partners, dynamic selection rounds, candidate pipelines, and work policies.
          </p>
        </div>
        <button onClick={onAddCompany} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search className="search-input-icon" size={16} />
          <input
            type="text"
            placeholder="Search by company name, CTC package, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select 
            className="select-filter"
            value={driveTypeFilter}
            onChange={(e) => setDriveTypeFilter(e.target.value)}
          >
            <option value="ALL">All Drive Types</option>
            <option value="On Campus">🏢 On Campus</option>
            <option value="Off Campus">🌐 Off Campus</option>
          </select>

          <select 
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Recruitment Statuses</option>
            <option value="Notified">Notified</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            className="select-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Opportunity Types</option>
            <option value="Full-time">Full-time (FTE)</option>
            <option value="Internship">Internship Only</option>
            <option value="FTE + Internship">FTE + Internship</option>
          </select>
        </div>
      </div>

      {/* Companies Data Table */}
      <div className="table-container">
        {filteredCompanies.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>No companies matched your filters</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try resetting search terms or add a new recruiting company.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Drive Type</th>
                <th>Package / CTC</th>
                <th>Eligibility Criteria</th>
                <th>Opportunity Type</th>
                <th>Work Hours & WFH</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <div 
                      style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                      onClick={() => onSelectCompany(company.id)}
                    >
                      {company.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {company.description || 'No description provided'}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: company.drive_type === 'Off Campus' ? '#f0fdf4' : '#eff6ff',
                      color: company.drive_type === 'Off Campus' ? '#15803d' : '#1d4ed8',
                      border: `1px solid ${company.drive_type === 'Off Campus' ? '#bbf7d0' : '#bfdbfe'}`
                    }}>
                      {company.drive_type === 'Off Campus' ? '🌐 Off Campus' : '🏢 On Campus'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-package">
                      {company.salary_package}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      ≥ {company.min_cgpa || 6.0} CGPA • {company.min_tenth_percentage || 60}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {company.current_arrears_allowed ? 'Arrears OK' : '0 Active Arrears'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {company.opportunity_type}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="var(--text-muted)" />
                      <span>{company.working_hours || '9 AM - 6 PM'}</span>
                    </div>
                    {company.wfh_info && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Home size={11} />
                        <span>{company.wfh_info}</span>
                      </div>
                    )}
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => onSelectCompany(company.id)}
                        className="btn btn-secondary btn-sm"
                        title="Manage candidates and selection rounds"
                      >
                        <Eye size={13} />
                        <span>Track</span>
                      </button>

                      <button 
                        onClick={() => onEditCompany(company)}
                        className="btn-icon-only"
                        title="Edit company and rounds"
                      >
                        <Edit size={14} />
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${company.name}? This will remove all associated selection rounds and candidate records.`)) {
                            onDeleteCompany(company.id);
                          }
                        }}
                        className="btn-icon-only"
                        title="Delete company"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
