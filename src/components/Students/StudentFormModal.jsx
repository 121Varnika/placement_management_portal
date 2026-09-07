import React, { useState, useEffect } from 'react';
import { X, GraduationCap, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { parseStudentId } from '../../utils/studentIdParser';

export default function StudentFormModal({ isOpen, onClose, onSave, student = null }) {
  const [formData, setFormData] = useState({
    college_id: '',
    name: '',
    college_email: '',
    work_personal_email: '',
    phone: '',
    cgpa: '',
    current_arrears: 0,
    arrears_history: 0,
    tenth_percentage: '',
    twelfth_percentage: '',
    github_url: '',
    linkedin_url: '',
    leetcode_url: '',
    portfolio_url: '',
    placement_status: 'Not Placed'
  });

  useEffect(() => {
    if (student) {
      setFormData({
        college_id: student.college_id || '',
        name: student.name || '',
        college_email: student.college_email || '',
        work_personal_email: student.work_personal_email || '',
        phone: student.phone || '',
        cgpa: student.cgpa !== undefined ? student.cgpa : '',
        current_arrears: student.current_arrears || 0,
        arrears_history: student.arrears_history || 0,
        tenth_percentage: student.tenth_percentage || '',
        twelfth_percentage: student.twelfth_percentage || '',
        github_url: student.github_url || '',
        linkedin_url: student.linkedin_url || '',
        leetcode_url: student.leetcode_url || '',
        portfolio_url: student.portfolio_url || '',
        placement_status: student.placement_status === 'Placed' ? 'Placed' : 'Not Placed'
      });
    } else {
      setFormData({
        college_id: '',
        name: '',
        college_email: '',
        work_personal_email: '',
        phone: '',
        cgpa: '',
        current_arrears: 0,
        arrears_history: 0,
        tenth_percentage: '',
        twelfth_percentage: '',
        github_url: '',
        linkedin_url: '',
        leetcode_url: '',
        portfolio_url: '',
        placement_status: 'Not Placed'
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  // Real-time Unique ID derivation
  const idParsed = parseStudentId(formData.college_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Student Name is required.');
      return;
    }

    if (!idParsed.isValid) {
      alert(`Invalid Unique ID: ${idParsed.error || 'Please enter a valid Cybersecurity and IoT ID (e.g. E0223006).'}`);
      return;
    }

    const payload = {
      ...formData,
      college_id: idParsed.cleanId,
      department: idParsed.department,
      batch: idParsed.batch,
      placement_status: formData.placement_status === 'Placed' ? 'Placed' : 'Not Placed'
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={20} color="var(--primary)" />
            <h3 className="modal-title">
              {student ? `Edit Profile: ${student.name} (${student.college_id})` : 'Register New Student'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            {/* 1. Identity & Auto-Derived Academic Details */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                1. Student Identity & Derived Academic Info
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Student Unique ID / Roll No <span className="req">*</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      (Format: E02YYNNN)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. E0223006"
                    value={formData.college_id}
                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value.toUpperCase() })}
                    required
                    style={{
                      borderColor: formData.college_id && !idParsed.isValid ? 'var(--danger)' : undefined,
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                {/* Auto-Derivation Showcase Card */}
                <div className="form-group full-width">
                  {idParsed.isValid ? (
                    <div style={{
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={20} color="var(--primary)" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {idParsed.department}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Joined: <strong>{idParsed.joiningYear}</strong> • Batch: <strong>{idParsed.batch}</strong> • Roll No: <strong>{idParsed.rollNumber}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: '1px solid #bfdbfe'
                        }}>
                          {idParsed.academicStatus.displayTag}
                        </span>
                        <span className="badge badge-completed">
                          <CheckCircle2 size={12} />
                          <span>ID Verified</span>
                        </span>
                      </div>
                    </div>
                  ) : formData.college_id.trim().length > 0 ? (
                    <div style={{
                      background: 'var(--danger-bg)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--danger)'
                    }}>
                      <AlertCircle size={16} />
                      <span>{idParsed.error || 'Must follow E02YYNNN (E = Engg, 02 = Cybersecurity & IoT, YY = Year, NNN = Roll)'}</span>
                    </div>
                  ) : (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)'
                    }}>
                      <Info size={15} />
                      <span>Enter Unique ID to automatically calculate Department, Joining Year, Batch, and Academic Semester.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Academic Scores & Arrears Track */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                2. Academic Performance & Placement Status
              </h4>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Current CGPA <span className="req">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-control"
                    placeholder="e.g. 8.75"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Standing Arrears</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={formData.current_arrears}
                    onChange={(e) => setFormData({ ...formData, current_arrears: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cleared Arrears History</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={formData.arrears_history}
                    onChange={(e) => setFormData({ ...formData, arrears_history: e.target.value })}
                  />
                </div>

                {/* Placement Status: ONLY Placed or Not Placed */}
                <div className="form-group">
                  <label className="form-label">Placement Status</label>
                  <select
                    className="form-control"
                    value={formData.placement_status}
                    onChange={(e) => setFormData({ ...formData, placement_status: e.target.value })}
                  >
                    <option value="Not Placed">Not Placed</option>
                    <option value="Placed">Placed</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">10th Standard Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-control"
                    placeholder="e.g. 92.5"
                    value={formData.tenth_percentage}
                    onChange={(e) => setFormData({ ...formData, tenth_percentage: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">12th / Diploma Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-control"
                    placeholder="e.g. 89.0"
                    value={formData.twelfth_percentage}
                    onChange={(e) => setFormData({ ...formData, twelfth_percentage: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 3. Communication Details */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                3. Communication Details
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">College Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. student@college.edu"
                    value={formData.college_email}
                    onChange={(e) => setFormData({ ...formData, college_email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Personal / Work Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. student@gmail.com"
                    value={formData.work_personal_email}
                    onChange={(e) => setFormData({ ...formData, work_personal_email: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 4. Professional Links */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                4. Profiles & Portfolio Links
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://github.com/username"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LeetCode URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://leetcode.com/username"
                    value={formData.leetcode_url}
                    onChange={(e) => setFormData({ ...formData, leetcode_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio Website URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://portfolio.dev"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {student ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
