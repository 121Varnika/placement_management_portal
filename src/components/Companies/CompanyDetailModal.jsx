import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Plus, 
  UserCheck, 
  UserX, 
  ArrowRight,
  Edit2,
  Trash2,
  FileText,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
  Users
} from 'lucide-react';
import { 
  getCompanyRounds, 
  getCompanyApplications, 
  saveApplication, 
  deleteApplication, 
  bulkSaveApplications,
  evaluateStudentEligibility,
  getStudents 
} from '../../services/api';

export default function CompanyDetailModal({ 
  company, 
  isOpen, 
  onClose, 
  onEdit, 
  onViewStudentProfile 
}) {
  const [rounds, setRounds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('in_process'); // 'in_process' | 'selected' | 'rejected' | 'not_applied'
  const [loading, setLoading] = useState(true);

  // Redesigned Enroll / Eligibility Evaluation modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollModalTab, setEnrollModalTab] = useState('eligible'); // 'eligible' | 'ineligible'
  const [enrollSearchTerm, setEnrollSearchTerm] = useState('');
  const [selectedEligibleIds, setSelectedEligibleIds] = useState([]);
  const [showDidNotApplyDialog, setShowDidNotApplyDialog] = useState(false);
  const [bulkReason, setBulkReason] = useState('Not Interested');
  const [bulkCustomReason, setBulkCustomReason] = useState('');
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Action modal for updating round / outcome
  const [actionModal, setActionModal] = useState(null); // { app, type: 'advance' | 'select' | 'reject' }
  const [actionNotes, setActionNotes] = useState('');
  const [actionTargetRound, setActionTargetRound] = useState('');

  const loadData = async () => {
    if (!company) return;
    setLoading(true);
    try {
      const [roundsData, appsData, studentsData] = await Promise.all([
        getCompanyRounds(company.id),
        getCompanyApplications(company.id),
        getStudents()
      ]);
      setRounds(roundsData);
      setApplications(appsData);
      setAllStudents(studentsData);
    } catch (e) {
      console.error('Failed to load company detail data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && company) {
      loadData();
    }
  }, [isOpen, company]);

  // Live Eligibility Evaluation of all students against company criteria
  const evaluatedCandidates = useMemo(() => {
    if (!isOpen || !company || !allStudents.length) return { eligible: [], ineligible: [] };

    const eligible = [];
    const ineligible = [];

    allStudents.forEach((student) => {
      const evaluation = evaluateStudentEligibility(student, company);
      const app = applications.find((a) => a.student_id === student.id);

      const candidateItem = {
        student,
        evaluation,
        existingApp: app || null,
        isEnrolled: app ? (app.status === 'Applied' || app.status === 'In Process' || app.status === 'Selected' || app.status === 'Rejected') : false,
        isDidNotApply: app ? app.status === 'Did Not Apply' : false,
        statusLabel: app ? app.status : 'Not Enrolled'
      };

      if (evaluation.isEligible) {
        eligible.push(candidateItem);
      } else {
        ineligible.push(candidateItem);
      }
    });

    return { eligible, ineligible };
  }, [allStudents, applications, company, isOpen]);

  const filteredEligible = useMemo(() => {
    if (!isOpen || !company) return [];
    const term = enrollSearchTerm.toLowerCase().trim();
    if (!term) return evaluatedCandidates.eligible;
    return evaluatedCandidates.eligible.filter(({ student }) => 
      student.name.toLowerCase().includes(term) ||
      student.college_id.toLowerCase().includes(term) ||
      (student.department && student.department.toLowerCase().includes(term))
    );
  }, [evaluatedCandidates.eligible, enrollSearchTerm, isOpen, company]);

  const filteredIneligible = useMemo(() => {
    if (!isOpen || !company) return [];
    const term = enrollSearchTerm.toLowerCase().trim();
    if (!term) return evaluatedCandidates.ineligible;
    return evaluatedCandidates.ineligible.filter(({ student, evaluation }) => 
      student.name.toLowerCase().includes(term) ||
      student.college_id.toLowerCase().includes(term) ||
      evaluation.reasons.some((r) => r.toLowerCase().includes(term))
    );
  }, [evaluatedCandidates.ineligible, enrollSearchTerm, isOpen, company]);

  if (!isOpen || !company) return null;

  // Categorize applications
  const inProcessApps = applications.filter((a) => a.status === 'In Process' || a.status === 'Applied');
  const selectedApps = applications.filter((a) => a.status === 'Selected');
  const rejectedApps = applications.filter((a) => a.status === 'Rejected');
  const notAppliedApps = applications.filter((a) => a.status === 'Did Not Apply');

  const availableToEnroll = filteredEligible.filter((item) => !item.isEnrolled);

  const handleToggleSelectAll = () => {
    const availableIds = availableToEnroll.map((item) => item.student.id);
    const allSelected = availableIds.length > 0 && availableIds.every((id) => selectedEligibleIds.includes(id));
    if (allSelected) {
      setSelectedEligibleIds((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      setSelectedEligibleIds((prev) => Array.from(new Set([...prev, ...availableIds])));
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedEligibleIds((prev) => 
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleBulkEnroll = async () => {
    if (selectedEligibleIds.length === 0) return;
    setIsSubmittingBulk(true);
    try {
      const initialRoundId = rounds[0]?.id || null;
      const appsToSave = selectedEligibleIds.map((studentId) => {
        const existing = applications.find((a) => a.student_id === studentId);
        return {
          ...(existing || {}),
          company_id: company.id,
          student_id: studentId,
          status: 'In Process',
          current_round_id: initialRoundId,
          not_applied_reason: null
        };
      });

      await bulkSaveApplications(appsToSave);
      await loadData();
      setSelectedEligibleIds([]);
      setShowEnrollModal(false);
    } catch (err) {
      alert('Failed to enroll students: ' + err.message);
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const handleOpenBulkDidNotApply = () => {
    if (selectedEligibleIds.length === 0) return;
    setBulkReason('Not Interested');
    setBulkCustomReason('');
    setShowDidNotApplyDialog(true);
  };

  const handleConfirmBulkDidNotApply = async (e) => {
    if (e) e.preventDefault();
    if (selectedEligibleIds.length === 0) return;

    let finalReason = bulkReason;
    if (bulkReason === 'Other') {
      if (!bulkCustomReason.trim()) {
        alert('Please specify the custom reason.');
        return;
      }
      finalReason = bulkCustomReason.trim();
    } else if (bulkCustomReason.trim()) {
      finalReason = `${bulkReason} (${bulkCustomReason.trim()})`;
    }

    setIsSubmittingBulk(true);
    try {
      const appsToSave = selectedEligibleIds.map((studentId) => {
        const existing = applications.find((a) => a.student_id === studentId);
        return {
          ...(existing || {}),
          company_id: company.id,
          student_id: studentId,
          status: 'Did Not Apply',
          not_applied_reason: finalReason,
          current_round_id: null
        };
      });

      await bulkSaveApplications(appsToSave);
      await loadData();
      setSelectedEligibleIds([]);
      setShowDidNotApplyDialog(false);
      setShowEnrollModal(false);
    } catch (err) {
      alert('Failed to record Did Not Apply: ' + err.message);
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Quick action: Promote student to next round
  const handleAdvanceRound = async (app, targetRoundId) => {
    try {
      await saveApplication({
        ...app,
        current_round_id: targetRoundId,
        status: 'In Process'
      });
      await loadData();
      setActionModal(null);
    } catch (e) {
      alert('Failed to update student round');
    }
  };

  // Quick action: Mark Selected
  const handleSelectStudent = async (app, finalRoundId) => {
    try {
      await saveApplication({
        ...app,
        status: 'Selected',
        outcome_round_id: finalRoundId || app.current_round_id,
        outcome_date: new Date().toISOString().split('T')[0],
        notes: actionNotes || app.notes || 'Offer accepted / selected.'
      });
      await loadData();
      setActionModal(null);
      setActionNotes('');
    } catch (e) {
      alert('Failed to select student');
    }
  };

  // Quick action: Mark Rejected
  const handleRejectStudent = async (app, eliminationRoundId) => {
    try {
      await saveApplication({
        ...app,
        status: 'Rejected',
        outcome_round_id: eliminationRoundId || app.current_round_id,
        outcome_date: new Date().toISOString().split('T')[0],
        notes: actionNotes || app.notes || 'Did not qualify in round.'
      });
      await loadData();
      setActionModal(null);
      setActionNotes('');
    } catch (e) {
      alert('Failed to reject student');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                Placement Drive Tracking & Details
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="modal-title" style={{ margin: 0 }}>{company.name}</h3>
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
                <span className={`badge ${
                  company.status === 'Completed' ? 'badge-completed' :
                  company.status === 'In Process' ? 'badge-in-process' : 'badge-notified'
                }`}>
                  {company.status}
                </span>
                <span className="badge badge-package">{company.salary_package}</span>
                {rounds.length === 0 && !loading && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #cbd5e1'
                  }}>
                    Rounds Not Specified
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {company.opportunity_type} • Notified on {company.notified_date}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onEdit && (
              <button 
                onClick={() => {
                  onClose();
                  onEdit(company);
                }} 
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} />
                <span>Edit Details</span>
              </button>
            )}
            <button onClick={onClose} className="btn-icon-only">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Eligibility Criteria Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Drive Eligibility Criteria
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Configured for automatic candidate evaluation
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>10th Minimum</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ≥ {company.min_tenth_percentage !== undefined ? company.min_tenth_percentage : 60}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>12th / Diploma</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ≥ {company.min_twelfth_percentage !== undefined ? company.min_twelfth_percentage : 60}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Minimum CGPA</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ≥ {company.min_cgpa !== undefined ? company.min_cgpa : 6.5}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Arrears</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: company.current_arrears_allowed ? '#059669' : '#dc2626' }}>
                  {company.current_arrears_allowed ? 'Allowed' : 'Not Allowed (0 Active)'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arrears History</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: company.arrears_history_allowed ? '#059669' : '#dc2626' }}>
                  {company.arrears_history_allowed ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>
            </div>
          </div>

          {/* Company Specs Card (Working Hours, Leave Policy, WFH) */}
          <div style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Working Hours
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {company.working_hours || '9:00 AM - 6:00 PM (Standard)'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Leave Policy
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {company.leave_policy || 'Standard institute policy'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Work From Home (WFH)
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                {company.wfh_info || 'Not specified'}
              </div>
            </div>
          </div>

          {/* Description if present */}
          {company.description && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              {company.description}
            </div>
          )}

          {/* Dynamic Selection Rounds Stepper / Timeline */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Selection Process Timeline {rounds.length > 0 ? `(${rounds.length} Rounds)` : ''}
              </h4>
              {rounds.length === 0 && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#475569', 
                  backgroundColor: '#f1f5f9', 
                  border: '1px solid #cbd5e1',
                  padding: '2px 8px', 
                  borderRadius: '4px' 
                }}>
                  Rounds Not Specified
                </span>
              )}
            </div>

            {rounds.length === 0 ? (
              <div style={{ 
                padding: '16px 20px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#64748b' 
              }}>
                <HelpCircle size={22} color="#94a3b8" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
                    Rounds Not Specified
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    No dynamic selection rounds have been specified for this drive yet. Candidates enrolled in this drive are tracked directly under the recruitment pipeline. You can add rounds anytime by editing this company.
                  </div>
                </div>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(company);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add Rounds</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounds-timeline">
                {rounds.map((round) => (
                  <div key={round.id} className="round-step-card">
                    <div className="round-step-header">
                      <span className="badge badge-package" style={{ fontSize: '0.7rem' }}>
                        Round {round.round_number}
                      </span>
                      {round.round_date && (
                        <span className="round-step-date">
                          {round.round_date}
                        </span>
                      )}
                    </div>
                    <div className="round-step-title">{round.round_type}</div>
                    {round.details && (
                      <div className="round-step-details">{round.details}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Candidate Management Tabs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Candidate Tracking
              </h4>
              <button
                onClick={() => {
                  setEnrollSearchTerm('');
                  setSelectedEligibleIds([]);
                  setEnrollModalTab('eligible');
                  setShowEnrollModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <UserCheck size={14} />
                <span>Record / Enroll Students</span>
              </button>
            </div>

            {/* Sub-Tabs */}
            <div className="tab-list">
              <button
                className={`tab-btn ${activeTab === 'in_process' ? 'active' : ''}`}
                onClick={() => setActiveTab('in_process')}
              >
                <span>Applied / In Process</span>
                <span className="tab-badge">{inProcessApps.length}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'selected' ? 'active' : ''}`}
                onClick={() => setActiveTab('selected')}
              >
                <span>Selected</span>
                <span className="tab-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                  {selectedApps.length}
                </span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                onClick={() => setActiveTab('rejected')}
              >
                <span>Rejected</span>
                <span className="tab-badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  {rejectedApps.length}
                </span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'not_applied' ? 'active' : ''}`}
                onClick={() => setActiveTab('not_applied')}
              >
                <span>Did Not Apply</span>
                <span className="tab-badge">{notAppliedApps.length}</span>
              </button>
            </div>

            {/* Tab 1: In Process Students */}
            {activeTab === 'in_process' && (
              <div className="table-container">
                {inProcessApps.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students currently in process. Click "Record / Enroll Student" above to add candidates.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>College ID</th>
                        <th>CGPA / Arrears</th>
                        <th>Current Round</th>
                        <th>Notes</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inProcessApps.map((app) => {
                        const student = app.students;
                        const currentRound = rounds.find((r) => r.id === app.current_round_id);
                        return (
                          <tr key={app.id}>
                            <td>
                              <div 
                                style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                onClick={() => onViewStudentProfile && student && onViewStudentProfile(student)}
                              >
                                {student?.name || 'Unknown Student'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {student?.department}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                {student?.college_id}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{student?.cgpa || 'N/A'} CGPA</div>
                              <div style={{ fontSize: '0.725rem', color: student?.current_arrears > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {student?.current_arrears > 0 ? `${student.current_arrears} standing arrear(s)` : 'All clear'}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-in-process">
                                {currentRound ? `Round ${currentRound.round_number}: ${currentRound.round_type}` : 'Registered'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                              {app.notes || '—'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                {/* Advance to next round (only when rounds are configured) */}
                                {rounds.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setActionModal({ app, type: 'advance' });
                                      setActionTargetRound(rounds[0]?.id || '');
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    title="Promote / Change Round"
                                  >
                                    <span>Move Round</span>
                                  </button>
                                )}
                                {/* Mark Selected */}
                                <button
                                  onClick={() => {
                                    setActionModal({ app, type: 'select' });
                                    setActionTargetRound(app.current_round_id || rounds[rounds.length - 1]?.id || '');
                                  }}
                                  className="btn btn-primary btn-sm"
                                  title="Mark as Selected"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Select</span>
                                </button>
                                {/* Mark Rejected */}
                                <button
                                  onClick={() => {
                                    setActionModal({ app, type: 'reject' });
                                    setActionTargetRound(app.current_round_id || '');
                                  }}
                                  className="btn btn-danger btn-sm"
                                  title="Mark as Rejected"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
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
            )}

            {/* Tab 2: Selected Students */}
            {activeTab === 'selected' && (
              <div className="table-container">
                {selectedApps.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students marked as selected yet.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>College ID</th>
                        <th>CGPA</th>
                        <th>Cleared Round</th>
                        <th>Selection Date</th>
                        <th>Offer Notes</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedApps.map((app) => {
                        const student = app.students;
                        const outcomeRound = rounds.find((r) => r.id === app.outcome_round_id);
                        return (
                          <tr key={app.id}>
                            <td>
                              <div 
                                style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                onClick={() => onViewStudentProfile && student && onViewStudentProfile(student)}
                              >
                                {student?.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {student?.department}
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                              {student?.college_id}
                            </td>
                            <td style={{ fontWeight: 600 }}>{student?.cgpa}</td>
                            <td>
                              <span className="badge badge-selected">
                                {outcomeRound ? `Cleared: ${outcomeRound.round_type}` : 'All Rounds Cleared'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {app.outcome_date || '—'}
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {app.notes || 'Selected'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={async () => {
                                  if (confirm('Revert this selection back to in-process?')) {
                                    await saveApplication({
                                      ...app,
                                      status: 'In Process',
                                      outcome_date: null
                                    });
                                    await loadData();
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Revert
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab 3: Rejected Students */}
            {activeTab === 'rejected' && (
              <div className="table-container">
                {rejectedApps.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No candidates recorded in rejected status.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>College ID</th>
                        <th>Eliminated At Round</th>
                        <th>Date</th>
                        <th>Feedback / Reason</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedApps.map((app) => {
                        const student = app.students;
                        const outcomeRound = rounds.find((r) => r.id === app.outcome_round_id);
                        return (
                          <tr key={app.id}>
                            <td>
                              <div 
                                style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                onClick={() => onViewStudentProfile && student && onViewStudentProfile(student)}
                              >
                                {student?.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {student?.department}
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                              {student?.college_id}
                            </td>
                            <td>
                              <span className="badge badge-rejected">
                                {outcomeRound ? `Round ${outcomeRound.round_number}: ${outcomeRound.round_type}` : 'Initial Round'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {app.outcome_date || '—'}
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {app.notes || 'Did not qualify'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={async () => {
                                  if (confirm('Revert back to in-process?')) {
                                    await saveApplication({
                                      ...app,
                                      status: 'In Process',
                                      outcome_date: null
                                    });
                                    await loadData();
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Re-evaluate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab 4: Did Not Apply & Reasons */}
            {activeTab === 'not_applied' && (
              <div className="table-container">
                {notAppliedApps.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students logged in the opt-out / did not apply list.
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>College ID</th>
                        <th>CGPA / Arrears</th>
                        <th>Documented Reason for Not Applying</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notAppliedApps.map((app) => {
                        const student = app.students;
                        return (
                          <tr key={app.id}>
                            <td>
                              <div 
                                style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                onClick={() => onViewStudentProfile && student && onViewStudentProfile(student)}
                              >
                                {student?.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {student?.department}
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                              {student?.college_id}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{student?.cgpa} CGPA</div>
                              <div style={{ fontSize: '0.725rem', color: student?.current_arrears > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                {student?.current_arrears > 0 ? `${student.current_arrears} arrear(s)` : 'Clear'}
                              </div>
                            </td>
                            <td>
                              <div style={{
                                padding: '6px 10px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.825rem',
                                color: 'var(--text-secondary)'
                              }}>
                                {app.not_applied_reason || 'No reason specified'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={async () => {
                                  if (confirm('Allow student to apply now?')) {
                                    await saveApplication({
                                      ...app,
                                      status: 'In Process',
                                      current_round_id: rounds[0]?.id || null,
                                      not_applied_reason: null
                                    });
                                    await loadData();
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Allow Apply
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {/* Popover / Dialog for Advancing / Selecting / Rejecting */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h4 className="modal-title">
                {actionModal.type === 'advance' ? 'Move Candidate to Round' :
                 actionModal.type === 'select' ? 'Select & Roll Out Offer' :
                 'Mark Candidate as Rejected'}
              </h4>
              <button onClick={() => setActionModal(null)} className="btn-icon-only">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student:</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {actionModal.app.students?.name} ({actionModal.app.students?.college_id})
                </div>
              </div>

              {actionModal.type === 'advance' && (
                rounds.length > 0 ? (
                  <div className="form-group">
                    <label className="form-label">Promote to Round:</label>
                    <select
                      className="form-control"
                      value={actionTargetRound}
                      onChange={(e) => setActionTargetRound(e.target.value)}
                    >
                      {rounds.map((r) => (
                        <option key={r.id} value={r.id}>
                          Round {r.round_number}: {r.round_type}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    Recruitment Drive: Rounds Not Specified. Candidate is in the general applicant pool.
                  </div>
                )
              )}

              {actionModal.type === 'reject' && (
                rounds.length > 0 ? (
                  <div className="form-group">
                    <label className="form-label">Round of Elimination (Optional):</label>
                    <select
                      className="form-control"
                      value={actionTargetRound}
                      onChange={(e) => setActionTargetRound(e.target.value)}
                    >
                      <option value="">-- General / Drive Screening --</option>
                      {rounds.map((r) => (
                        <option key={r.id} value={r.id}>
                          Round {r.round_number}: {r.round_type}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    Recruitment Drive: Rounds Not Specified (Overall Drive Evaluation)
                  </div>
                )
              )}

              {actionModal.type === 'select' && (
                rounds.length > 0 ? (
                  <div className="form-group">
                    <label className="form-label">Final Round Cleared (Optional):</label>
                    <select
                      className="form-control"
                      value={actionTargetRound}
                      onChange={(e) => setActionTargetRound(e.target.value)}
                    >
                      <option value="">-- Direct Offer / Drive Final --</option>
                      {rounds.map((r) => (
                        <option key={r.id} value={r.id}>
                          Round {r.round_number}: {r.round_type}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.8rem', color: '#166534' }}>
                    Recruitment Drive: Rounds Not Specified (Selected for Final Offer)
                  </div>
                )
              )}

              <div className="form-group">
                <label className="form-label">Mentor Notes / Feedback:</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter remarks, scores or feedback..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setActionModal(null)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionModal.type === 'advance') {
                    handleAdvanceRound(actionModal.app, actionTargetRound);
                  } else if (actionModal.type === 'select') {
                    handleSelectStudent(actionModal.app, actionTargetRound);
                  } else {
                    handleRejectStudent(actionModal.app, actionTargetRound);
                  }
                }}
                className={`btn btn-sm ${
                  actionModal.type === 'select' ? 'btn-primary' :
                  actionModal.type === 'reject' ? 'btn-danger' : 'btn-primary'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REDESIGNED: Candidate Eligibility Evaluation & Bulk Enrollment Workflow Modal */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="var(--primary)" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="modal-title" style={{ margin: 0 }}>Record / Enroll Students for {company.name}</h3>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: company.drive_type === 'Off Campus' ? '#f0fdf4' : '#eff6ff',
                      color: company.drive_type === 'Off Campus' ? '#15803d' : '#1d4ed8',
                      border: `1px solid ${company.drive_type === 'Off Campus' ? '#bbf7d0' : '#bfdbfe'}`
                    }}>
                      {company.drive_type || 'On Campus'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Students are automatically evaluated against {company.name} criteria (≥{company.min_cgpa || 6.0} CGPA • ≥{company.min_tenth_percentage || 60}% 10th • ≥{company.min_twelfth_percentage || 60}% 12th • {company.current_arrears_allowed ? 'Arrears Allowed' : '0 Active Arrears'})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEnrollModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-Header: Search and Tabs */}
            <div style={{ padding: '14px 24px 0', background: '#ffffff', flexShrink: 0, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                {/* Search */}
                <div className="search-input-group" style={{ maxWidth: '380px', margin: 0 }}>
                  <Search className="search-input-icon" size={15} />
                  <input
                    type="text"
                    placeholder="Search candidate by name, Unique ID, or dept..."
                    value={enrollSearchTerm}
                    onChange={(e) => setEnrollSearchTerm(e.target.value)}
                  />
                </div>

                {/* Criteria Summary Pill */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--surface-subtle)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  Criteria: <strong>≥{company.min_cgpa || 6.0} CGPA</strong> • <strong>{company.min_tenth_percentage || 60}% 10th</strong> • <strong>{company.current_arrears_allowed ? 'Arrears OK' : '0 Arrears'}</strong>
                </div>
              </div>

              {/* Tabs: Eligible vs Ineligible */}
              <div className="tab-list" style={{ marginBottom: 0 }}>
                <button
                  className={`tab-btn ${enrollModalTab === 'eligible' ? 'active' : ''}`}
                  onClick={() => setEnrollModalTab('eligible')}
                >
                  <ShieldCheck size={16} color={enrollModalTab === 'eligible' ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>Eligible Candidates</span>
                  <span className="tab-badge" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                    {evaluatedCandidates.eligible.length}
                  </span>
                </button>

                <button
                  className={`tab-btn ${enrollModalTab === 'ineligible' ? 'active' : ''}`}
                  onClick={() => setEnrollModalTab('ineligible')}
                >
                  <ShieldAlert size={16} color={enrollModalTab === 'ineligible' ? 'var(--danger)' : 'var(--text-muted)'} />
                  <span>Not Eligible</span>
                  <span className="tab-badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
                    {evaluatedCandidates.ineligible.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {/* TAB 1: ELIGIBLE STUDENTS */}
              {enrollModalTab === 'eligible' && (
                <div>
                  {/* Bulk Action Controls Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: availableToEnroll.length ? 'pointer' : 'default', fontWeight: 600, fontSize: '0.825rem', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={availableToEnroll.length > 0 && availableToEnroll.every((item) => selectedEligibleIds.includes(item.student.id))}
                          onChange={handleToggleSelectAll}
                          disabled={availableToEnroll.length === 0}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <span>Select All Available ({availableToEnroll.length})</span>
                      </label>

                      {selectedEligibleIds.length > 0 && (
                        <span className="badge badge-package" style={{ fontSize: '0.75rem' }}>
                          {selectedEligibleIds.length} candidate(s) selected
                        </span>
                      )}
                    </div>

                    {/* Bulk Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={handleBulkEnroll}
                        disabled={selectedEligibleIds.length === 0 || isSubmittingBulk}
                        className="btn btn-primary btn-sm"
                        style={{ opacity: selectedEligibleIds.length === 0 ? 0.5 : 1 }}
                        title="Enroll all selected eligible students into this drive"
                      >
                        <UserCheck size={14} />
                        <span>Enroll Selected ({selectedEligibleIds.length})</span>
                      </button>

                      <button
                        onClick={handleOpenBulkDidNotApply}
                        disabled={selectedEligibleIds.length === 0 || isSubmittingBulk}
                        className="btn btn-secondary btn-sm"
                        style={{ opacity: selectedEligibleIds.length === 0 ? 0.5 : 1 }}
                        title="Mark selected candidates as Did Not Apply with a documented reason"
                      >
                        <UserX size={14} />
                        <span>Record Did Not Apply ({selectedEligibleIds.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Eligible Candidates Table */}
                  {filteredEligible.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No eligible students match the current search filter.
                    </div>
                  ) : (
                    <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Select</th>
                            <th>Student</th>
                            <th>Unique ID</th>
                            <th>CGPA</th>
                            <th>10th %</th>
                            <th>12th / Dip %</th>
                            <th>Arrears</th>
                            <th>Drive Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEligible.map(({ student, isEnrolled, isDidNotApply, existingApp, statusLabel }) => {
                            const isSelected = selectedEligibleIds.includes(student.id);

                            return (
                              <tr 
                                key={student.id} 
                                style={{ 
                                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                                  transition: 'background-color 0.1s ease'
                                }}
                              >
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleStudent(student.id)}
                                    disabled={isEnrolled}
                                    style={{ 
                                      width: '16px', 
                                      height: '16px', 
                                      accentColor: 'var(--primary)', 
                                      cursor: isEnrolled ? 'not-allowed' : 'pointer' 
                                    }}
                                    title={isEnrolled ? `Candidate is already enrolled (${statusLabel})` : 'Select candidate'}
                                  />
                                </td>
                                <td>
                                  <div 
                                    style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                    onClick={() => onViewStudentProfile && onViewStudentProfile(student)}
                                  >
                                    {student.name}
                                  </div>
                                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                    {student.department}
                                  </div>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>
                                  {student.college_id}
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    {parseFloat(student.cgpa).toFixed(2)}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  {student.tenth_percentage ? `${student.tenth_percentage}%` : '—'}
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  {student.twelfth_percentage ? `${student.twelfth_percentage}%` : '—'}
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.78rem', color: student.current_arrears > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                                    {student.current_arrears > 0 ? `${student.current_arrears} Active` : '0 Active'}
                                  </span>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    Hist: {student.arrears_history || 0}
                                  </div>
                                </td>
                                <td>
                                  {isEnrolled ? (
                                    <span className={`badge ${
                                      statusLabel === 'Selected' ? 'badge-completed' :
                                      statusLabel === 'In Process' ? 'badge-in-process' : 'badge-package'
                                    }`} style={{ fontSize: '0.7rem' }}>
                                      {statusLabel === 'In Process' ? 'Enrolled / In Process' : statusLabel}
                                    </span>
                                  ) : isDidNotApply ? (
                                    <div>
                                      <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}>
                                        Did Not Apply
                                      </span>
                                      {existingApp?.not_applied_reason && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={existingApp.not_applied_reason}>
                                          {existingApp.not_applied_reason}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '0.7rem' }}>
                                      Available to Enroll
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INELIGIBLE STUDENTS */}
              {enrollModalTab === 'ineligible' && (
                <div>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <AlertTriangle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8rem', color: '#9f1239' }}>
                      These students do not meet the minimum eligibility criteria defined for <strong>{company.name}</strong>. Per institute policy, they are strictly ineligible for selection enrollment.
                    </div>
                  </div>

                  {filteredIneligible.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      All students currently qualify under this company's criteria!
                    </div>
                  ) : (
                    <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Unique ID</th>
                            <th>CGPA</th>
                            <th>10th / 12th</th>
                            <th>Arrears</th>
                            <th>Reason(s) for Ineligibility</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIneligible.map(({ student, evaluation }) => (
                            <tr key={student.id} style={{ opacity: 0.9 }}>
                              <td>
                                <div 
                                  style={{ fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                                  onClick={() => onViewStudentProfile && onViewStudentProfile(student)}
                                >
                                  {student.name}
                                </div>
                                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                  {student.department}
                                </div>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                {student.college_id}
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: student.cgpa < (company.min_cgpa || 6.0) ? '#e11d48' : 'var(--text-main)' }}>
                                  {parseFloat(student.cgpa).toFixed(2)}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.78rem' }}>
                                <div>10th: {student.tenth_percentage || 0}%</div>
                                <div>12th: {student.twelfth_percentage || 0}%</div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.78rem', color: student.current_arrears > 0 ? '#e11d48' : 'var(--text-main)', fontWeight: 600 }}>
                                  {student.current_arrears} Active
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Hist: {student.arrears_history || 0}
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {evaluation.reasons.map((reason, idx) => (
                                    <div 
                                      key={idx}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '2px 8px',
                                        background: '#fff1f2',
                                        border: '1px solid #ffe4e6',
                                        borderRadius: '4px',
                                        color: '#be123c',
                                        fontSize: '0.725rem',
                                        fontWeight: 500
                                      }}
                                    >
                                      <span>✕</span>
                                      <span>{reason}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
                Total Evaluated: <strong>{allStudents.length} Students</strong> ({evaluatedCandidates.eligible.length} Eligible, {evaluatedCandidates.ineligible.length} Ineligible)
              </span>
              <button onClick={() => setShowEnrollModal(false)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk "Did Not Apply" Reason Assignment Dialog */}
      {showDidNotApplyDialog && (
        <div className="modal-overlay" onClick={() => setShowDidNotApplyDialog(false)} style={{ zIndex: 10000 }}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserX size={18} color="var(--danger)" />
                <h4 className="modal-title" style={{ margin: 0 }}>Record "Did Not Apply" in Bulk</h4>
              </div>
              <button onClick={() => setShowDidNotApplyDialog(false)} className="btn-icon-only">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmBulkDidNotApply} style={{ display: 'contents' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)'
                }}>
                  Assigning reason for <strong>{selectedEligibleIds.length} selected eligible candidates</strong> who did not participate in the <strong>{company.name}</strong> recruitment drive.
                </div>

                <div className="form-group">
                  <label className="form-label">Select Standard Reason <span className="req">*</span></label>
                  <select
                    className="form-control"
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    required
                  >
                    <option value="Not Interested">Not Interested</option>
                    <option value="Already Placed">Already Placed</option>
                    <option value="Higher Package Already Secured">Higher Package Already Secured</option>
                    <option value="Personal Reason">Personal Reason</option>
                    <option value="Eligibility/Preference Issue">Eligibility / Preference Issue</option>
                    <option value="Other">Other (Specify below)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {bulkReason === 'Other' ? 'Custom Reason Note *' : 'Additional Notes / Remarks (Optional)'}
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder={bulkReason === 'Other' ? 'Specify the exact reason for opting out...' : 'Optional details or remarks for student placement record...'}
                    value={bulkCustomReason}
                    onChange={(e) => setBulkCustomReason(e.target.value)}
                    required={bulkReason === 'Other'}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowDidNotApplyDialog(false)} 
                  className="btn btn-secondary btn-sm"
                  disabled={isSubmittingBulk}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingBulk}
                >
                  {isSubmittingBulk ? 'Saving...' : `Confirm Did Not Apply (${selectedEligibleIds.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
