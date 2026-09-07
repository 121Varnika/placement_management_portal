import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UploadCloud,
  Code
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, LeetcodeIcon } from '../common/BrandIcons';
import { parseStudentId } from '../../utils/studentIdParser';

export default function StudentListView({ 
  students = [], 
  onAddStudent, 
  onEditStudent, 
  onDeleteStudent, 
  onViewProfile,
  onImportCsv
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [arrearsFilter, setArrearsFilter] = useState('ALL');

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    const parsed = parseStudentId(student.college_id);
    const resolvedDept = parsed.isValid ? parsed.department : (student.department || '');

    const matchesSearch = 
      student.name.toLowerCase().includes(search) ||
      student.college_id.toLowerCase().includes(search) ||
      (student.college_email && student.college_email.toLowerCase().includes(search)) ||
      resolvedDept.toLowerCase().includes(search);

    const matchesDept = deptFilter === 'ALL' || resolvedDept === deptFilter;
    
    // Normalize status: strictly Placed or Not Placed
    const normalizedStatus = student.placement_status === 'Placed' ? 'Placed' : 'Not Placed';
    const matchesStatus = statusFilter === 'ALL' || normalizedStatus === statusFilter;
    
    let matchesArrears = true;
    if (arrearsFilter === 'CLEAR') {
      matchesArrears = student.current_arrears === 0;
    } else if (arrearsFilter === 'HAS_ARREARS') {
      matchesArrears = student.current_arrears > 0;
    }

    return matchesSearch && matchesDept && matchesStatus && matchesArrears;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
          <p className="page-desc">
            Cybersecurity and IoT department student academic records, arrears status, and placement outcomes.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onImportCsv} className="btn btn-secondary">
            <UploadCloud size={16} />
            <span>Import CSV</span>
          </button>
          <button onClick={onAddStudent} className="btn btn-primary">
            <Plus size={16} />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search className="search-input-icon" size={16} />
          <input
            type="text"
            placeholder="Search by name, Unique ID (E0223...), or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          {/* Department Filter - Focused on Cybersecurity and IoT */}
          <select 
            className="select-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Cybersecurity and IoT">Cybersecurity and IoT</option>
          </select>

          {/* Placement Status Filter - ONLY Placed or Not Placed */}
          <select 
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Placement Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Not Placed">Not Placed</option>
          </select>

          {/* Arrears Filter */}
          <select 
            className="select-filter"
            value={arrearsFilter}
            onChange={(e) => setArrearsFilter(e.target.value)}
          >
            <option value="ALL">All Arrears Records</option>
            <option value="CLEAR">No Standing Arrears (Clear)</option>
            <option value="HAS_ARREARS">Has Standing Arrears</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="table-container">
        {filteredStudents.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <GraduationCap size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>No students found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try adjusting search or department filters, or import students via CSV.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student & Unique ID</th>
                <th>Department & Batch</th>
                <th>Academic Status</th>
                <th>CGPA</th>
                <th>Arrears Track</th>
                <th>10th / 12th</th>
                <th>Profiles</th>
                <th>Placement</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const parsed = parseStudentId(student.college_id);
                const deptName = parsed.isValid ? parsed.department : (student.department || 'Cybersecurity and IoT');
                const batchText = parsed.isValid ? parsed.batch : (student.batch || '2023–2027');
                const isPlaced = student.placement_status === 'Placed';

                return (
                  <tr key={student.id}>
                    <td>
                      <div 
                        style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                        onClick={() => onViewProfile(student)}
                      >
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {student.college_id}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        {deptName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Batch {batchText}
                      </div>
                    </td>
                    <td>
                      {parsed.isValid ? (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: '#eff6ff', 
                          color: '#1d4ed8', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>
                          {parsed.academicStatus.displayTag}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Standard
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.9rem',
                        color: student.cgpa >= 8.5 ? '#047857' : student.cgpa >= 7.5 ? '#2563eb' : '#334155' 
                      }}>
                        {student.cgpa}
                      </span>
                    </td>
                    <td>
                      {student.current_arrears > 0 ? (
                        <span className="badge badge-not-placed">
                          {student.current_arrears} Current
                        </span>
                      ) : (
                        <span className="badge badge-placed">
                          All Clear
                        </span>
                      )}
                      {student.arrears_history > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {student.arrears_history} cleared history
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                        10th: <span style={{ fontWeight: 600 }}>{student.tenth_percentage ? `${student.tenth_percentage}%` : '—'}</span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                        12th: <span style={{ fontWeight: 600 }}>{student.twelfth_percentage ? `${student.twelfth_percentage}%` : '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {student.github_url && (
                          <a href={student.github_url} target="_blank" rel="noreferrer" title="GitHub" style={{ color: '#334155' }}>
                            <GithubIcon size={15} />
                          </a>
                        )}
                        {student.linkedin_url && (
                          <a href={student.linkedin_url} target="_blank" rel="noreferrer" title="LinkedIn" style={{ color: '#0a66c2' }}>
                            <LinkedinIcon size={15} />
                          </a>
                        )}
                        {student.leetcode_url && (
                          <a href={student.leetcode_url} target="_blank" rel="noreferrer" title="LeetCode" style={{ color: '#d97706' }}>
                            <LeetcodeIcon size={15} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isPlaced ? 'badge-placed' : 'badge-not-placed'}`}>
                        {isPlaced ? 'Placed' : 'Not Placed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => onViewProfile(student)}
                          className="btn btn-secondary btn-sm"
                          title="View profile and placement timeline"
                        >
                          <Eye size={13} />
                          <span>Profile</span>
                        </button>

                        <button 
                          onClick={() => onEditStudent(student)}
                          className="btn-icon-only"
                          title="Edit Student"
                        >
                          <Edit size={14} />
                        </button>

                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${student.name}? This will also delete their placement records.`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="btn-icon-only"
                          title="Delete Student"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
