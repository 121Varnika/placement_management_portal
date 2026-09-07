import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Building2, Briefcase, HelpCircle } from 'lucide-react';

const COMMON_ROUND_TYPES = [
  'Online Aptitude / Assessment',
  'Coding Challenge (DSA)',
  'Technical Interview 1',
  'Technical Interview 2',
  'System Design / Architecture',
  'Managerial / As Appropriate Round',
  'HR Interview',
  'Group Discussion (GD)',
  'Assignment / Project Review'
];

export default function CompanyFormModal({ isOpen, onClose, onSave, company = null, initialRounds = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    salary_package: '',
    opportunity_type: 'Full-time',
    drive_type: 'On Campus',
    min_tenth_percentage: 60.0,
    min_twelfth_percentage: 60.0,
    min_cgpa: 6.5,
    current_arrears_allowed: false,
    arrears_history_allowed: true,
    notified_date: new Date().toISOString().split('T')[0],
    status: 'Notified',
    working_hours: '9:00 AM - 6:00 PM (Mon-Fri)',
    leave_policy: '18 days paid vacation + festival leaves',
    wfh_info: 'Hybrid (2 days WFH / 3 days in office)'
  });

  const [roundsNotSpecified, setRoundsNotSpecified] = useState(false);
  const [rounds, setRounds] = useState([
    { round_number: 1, round_type: 'Online Assessment', round_date: '', details: 'Aptitude & DSA test' }
  ]);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        salary_package: company.salary_package || '',
        opportunity_type: company.opportunity_type || 'Full-time',
        drive_type: company.drive_type || 'On Campus',
        min_tenth_percentage: company.min_tenth_percentage !== undefined ? company.min_tenth_percentage : 60.0,
        min_twelfth_percentage: company.min_twelfth_percentage !== undefined ? company.min_twelfth_percentage : 60.0,
        min_cgpa: company.min_cgpa !== undefined ? company.min_cgpa : 6.5,
        current_arrears_allowed: company.current_arrears_allowed !== undefined ? Boolean(company.current_arrears_allowed) : false,
        arrears_history_allowed: company.arrears_history_allowed !== undefined ? Boolean(company.arrears_history_allowed) : true,
        notified_date: company.notified_date || new Date().toISOString().split('T')[0],
        status: company.status || 'Notified',
        working_hours: company.working_hours || '',
        leave_policy: company.leave_policy || '',
        wfh_info: company.wfh_info || ''
      });

      if (initialRounds && initialRounds.length > 0) {
        setRoundsNotSpecified(false);
        setRounds(initialRounds.map((r, i) => ({
          id: r.id,
          round_number: r.round_number || i + 1,
          round_type: r.round_type || '',
          round_date: r.round_date || '',
          details: r.details || ''
        })));
      } else {
        setRoundsNotSpecified(true);
        setRounds([]);
      }
    } else {
      // Default new company state
      setFormData({
        name: '',
        description: '',
        salary_package: '',
        opportunity_type: 'Full-time',
        drive_type: 'On Campus',
        min_tenth_percentage: 60.0,
        min_twelfth_percentage: 60.0,
        min_cgpa: 6.5,
        current_arrears_allowed: false,
        arrears_history_allowed: true,
        notified_date: new Date().toISOString().split('T')[0],
        status: 'Notified',
        working_hours: '9:00 AM - 6:00 PM (Mon-Fri)',
        leave_policy: '18 days annual leave + standard holidays',
        wfh_info: 'Hybrid (2 days WFH / 3 days office)'
      });
      setRoundsNotSpecified(false);
      setRounds([
        { round_number: 1, round_type: 'Online Assessment', round_date: '', details: 'Online coding & aptitude' }
      ]);
    }
  }, [company, initialRounds, isOpen]);

  if (!isOpen) return null;

  const handleAddRound = () => {
    setRoundsNotSpecified(false);
    setRounds([
      ...rounds,
      {
        round_number: rounds.length + 1,
        round_type: COMMON_ROUND_TYPES[Math.min(rounds.length, COMMON_ROUND_TYPES.length - 1)],
        round_date: '',
        details: ''
      }
    ]);
  };

  const handleRemoveRound = (idx) => {
    const updated = rounds.filter((_, i) => i !== idx).map((r, i) => ({
      ...r,
      round_number: i + 1
    }));
    if (updated.length === 0) {
      setRoundsNotSpecified(true);
      setRounds([]);
    } else {
      setRounds(updated);
    }
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = [...rounds];
    updated[idx][field] = value;
    setRounds(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.salary_package.trim()) {
      alert('Please fill in company name and salary package.');
      return;
    }
    if (!roundsNotSpecified) {
      if (rounds.length === 0) {
        alert('Please add at least one selection round or choose "Rounds Not Specified".');
        return;
      }
      for (let i = 0; i < rounds.length; i++) {
        if (!rounds[i].round_type || !rounds[i].round_type.trim()) {
          alert(`Please enter a round type for Round ${i + 1} or switch to "Rounds Not Specified".`);
          return;
        }
      }
    }
    onSave(formData, roundsNotSpecified ? [] : rounds);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--primary)" />
            <h3 className="modal-title">
              {company ? `Edit Company: ${company.name}` : 'Add New Recruitment Company'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            {/* Section 1: Core Company Details */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                Basic Information
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Company Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Google Cloud, Microsoft, Zoho"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Salary Package / CTC <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 14 LPA or 8.5 - 12 LPA"
                    value={formData.salary_package}
                    onChange={(e) => setFormData({ ...formData, salary_package: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Drive Type <span className="req">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={formData.drive_type}
                    onChange={(e) => setFormData({ ...formData, drive_type: e.target.value })}
                    required
                  >
                    <option value="On Campus">🏢 On Campus Drive</option>
                    <option value="Off Campus">🌐 Off Campus Drive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Opportunity Type</label>
                  <select
                    className="form-control"
                    value={formData.opportunity_type}
                    onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time (FTE)</option>
                    <option value="Internship">Internship Only</option>
                    <option value="FTE + Internship">FTE + Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Recruitment Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Notified">Notified (Upcoming)</option>
                    <option value="In Process">In Process (Active Rounds)</option>
                    <option value="Completed">Completed (Offers Rolled Out)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notified Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.notified_date}
                    onChange={(e) => setFormData({ ...formData, notified_date: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Job Role & Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Brief description of the role, department eligibility, CTC breakdown..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Eligibility Criteria Configuration */}
            <div style={{
              marginBottom: '24px',
              padding: '16px 18px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px'
            }}>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Eligibility Criteria Configuration
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  Students are automatically evaluated against these thresholds to qualify for enrollment.
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Min. 10th Score (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.min_tenth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_tenth_percentage: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min. 12th / Diploma (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.min_twelfth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_twelfth_percentage: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min. CGPA (Out of 10)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    className="form-control"
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({ ...formData, min_cgpa: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Standing Active Arrears</label>
                  <select
                    className="form-control"
                    value={formData.current_arrears_allowed ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, current_arrears_allowed: e.target.value === 'yes' })}
                  >
                    <option value="no">Not Allowed (Strict 0 current arrears)</option>
                    <option value="yes">Allowed (Standing arrears permitted)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Past Arrears History</label>
                  <select
                    className="form-control"
                    value={formData.arrears_history_allowed ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, arrears_history_allowed: e.target.value === 'yes' })}
                  >
                    <option value="yes">Allowed (Cleared history OK)</option>
                    <option value="no">Not Allowed (Zero past arrears)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Work Policy & Benefits */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                Workplace Policies (Work Hours, Leaves & WFH)
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Working Hours</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9:00 AM - 6:00 PM (Mon-Fri, 5 days/wk)"
                    value={formData.working_hours}
                    onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Leave Policy</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 18 days paid leaves + 12 casual leaves"
                    value={formData.leave_policy}
                    onChange={(e) => setFormData({ ...formData, leave_policy: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Work From Home (WFH) / Remote Policy</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Hybrid (3 days office, 2 days remote) or On-site only"
                    value={formData.wfh_info}
                    onChange={(e) => setFormData({ ...formData, wfh_info: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Selection Rounds (Dynamic or Not Specified) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Selection Process Rounds {roundsNotSpecified ? '(Rounds Not Specified)' : `(${rounds.length})`}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Define dynamic selection rounds or mark as "Rounds Not Specified"
                  </span>
                </div>

                {/* Option Toggle */}
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--surface-subtle)',
                  padding: '3px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  gap: '4px'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRoundsNotSpecified(false);
                      if (rounds.length === 0) {
                        setRounds([{ round_number: 1, round_type: 'Online Assessment', round_date: '', details: '' }]);
                      }
                    }}
                    className={`btn btn-sm ${!roundsNotSpecified ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none'
                    }}
                  >
                    Configure Rounds {!roundsNotSpecified && `(${rounds.length})`}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoundsNotSpecified(true);
                      setRounds([]);
                    }}
                    className={`btn btn-sm ${roundsNotSpecified ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none'
                    }}
                  >
                    Rounds Not Specified
                  </button>
                </div>
              </div>

              {roundsNotSpecified ? (
                <div style={{
                  padding: '18px 20px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <HelpCircle size={22} color="#64748b" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
                      Rounds Not Specified
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      This placement drive will be saved without predefined selection rounds. No empty round records will be created. You can track candidates directly or configure actual rounds later at any time.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRoundsNotSpecified(false);
                      setRounds([{ round_number: 1, round_type: 'Online Assessment', round_date: '', details: '' }]);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Plus size={13} />
                    <span>Add First Round</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={handleAddRound}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Plus size={13} />
                      <span>Add Another Round</span>
                    </button>
                  </div>

                  <div className="rounds-builder">
                    {rounds.map((round, idx) => (
                      <div key={idx} className="round-item-row">
                        <div className="round-num-badge">
                          {idx + 1}
                        </div>

                        <div>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Round Type (e.g. OA, Tech 1)"
                            value={round.round_type}
                            onChange={(e) => handleRoundChange(idx, 'round_type', e.target.value)}
                            required
                            list="round-types-list"
                          />
                        </div>

                        <div>
                          <input
                            type="date"
                            className="form-control"
                            value={round.round_date || ''}
                            onChange={(e) => handleRoundChange(idx, 'round_date', e.target.value)}
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Details (platform, duration, syllabus)"
                            value={round.details || ''}
                            onChange={(e) => handleRoundChange(idx, 'details', e.target.value)}
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRound(idx)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Remove Round"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <datalist id="round-types-list">
                    {COMMON_ROUND_TYPES.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {company ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
