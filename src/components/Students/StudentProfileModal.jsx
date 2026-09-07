import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  Mail, 
  Phone, 
  ExternalLink, 
  Globe, 
  FileText, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, LeetcodeIcon } from '../common/BrandIcons';
import { getStudentApplications } from '../../services/api';
import { parseStudentId } from '../../utils/studentIdParser';

export default function StudentProfileModal({ 
  student, 
  isOpen, 
  onClose, 
  onEdit, 
  onSelectCompany 
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentApps() {
      if (!student) return;
      setLoading(true);
      try {
        const apps = await getStudentApplications(student.id);
        setApplications(apps);
      } catch (e) {
        console.error('Failed to load student applications', e);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen && student) {
      loadStudentApps();
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const initials = student.name
    ? student.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'ST';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} color="var(--primary)" />
            <h3 className="modal-title">Student Profile & Placement Record</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onEdit && (
              <button 
                onClick={() => {
                  onClose();
                  onEdit(student);
                }} 
                className="btn btn-secondary btn-sm"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            )}
            <button onClick={onClose} className="btn-icon-only">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Top Profile Card */}
          {(() => {
            const parsedId = parseStudentId(student.college_id);
            const isPlaced = student.placement_status === 'Placed';
            const deptText = parsedId.isValid ? parsedId.department : (student.department || 'Cybersecurity and IoT');
            const batchText = parsedId.isValid ? parsedId.batch : (student.batch || '2023–2027');

            return (
              <div className="student-profile-header">
                <div className="student-big-avatar">{initials}</div>

                <div className="student-header-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      {student.name}
                    </h2>
                    <span className={`badge ${isPlaced ? 'badge-placed' : 'badge-not-placed'}`}>
                      {isPlaced ? 'Placed' : 'Not Placed'}
                    </span>
                    {parsedId.isValid && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe'
                      }}>
                        {parsedId.academicStatus.displayTag}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                      {student.college_id}
                    </span>
                    <span>•</span>
                    <span style={{ fontWeight: 600 }}>{deptText}</span>
                    <span>•</span>
                    <span>Batch {batchText}</span>
                  </div>

                  {/* Contacts */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {student.college_email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={13} />
                        <span>{student.college_email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={13} />
                        <span>{student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Academic Metric Badges Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Current CGPA</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                {student.cgpa || '0.00'}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Current Arrears</div>
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: 800, 
                color: student.current_arrears > 0 ? 'var(--danger)' : 'var(--success)', 
                marginTop: '2px' 
              }}>
                {student.current_arrears > 0 ? student.current_arrears : '0 (Clear)'}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>History of Arrears</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '2px' }}>
                {student.arrears_history || 0}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>10th Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '2px' }}>
                {student.tenth_percentage ? `${student.tenth_percentage}%` : '—'}
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>12th Score</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '2px' }}>
                {student.twelfth_percentage ? `${student.twelfth_percentage}%` : '—'}
              </div>
            </div>
          </div>

          {/* Links & Profiles */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
              Portfolios & Profile Links
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {student.github_url && (
                <a href={student.github_url} target="_blank" rel="noreferrer" className="profile-link-btn">
                  <GithubIcon size={15} />
                  <span>GitHub</span>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              )}

              {student.linkedin_url && (
                <a href={student.linkedin_url} target="_blank" rel="noreferrer" className="profile-link-btn">
                  <LinkedinIcon size={15} />
                  <span>LinkedIn</span>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              )}

              {student.leetcode_url && (
                <a href={student.leetcode_url} target="_blank" rel="noreferrer" className="profile-link-btn">
                  <LeetcodeIcon size={15} />
                  <span>LeetCode</span>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              )}

              {student.portfolio_url && (
                <a href={student.portfolio_url} target="_blank" rel="noreferrer" className="profile-link-btn">
                  <Globe size={15} color="var(--primary)" />
                  <span>Portfolio</span>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              )}

              {!student.github_url && !student.linkedin_url && !student.leetcode_url && !student.portfolio_url && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No links provided yet.</span>
              )}
            </div>
          </div>

          {/* Placement History Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Placement & Application History ({applications.length})
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Track record across campus recruitment drives
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
            ) : applications.length === 0 ? (
              <div style={{ padding: '28px', background: 'var(--surface-subtle)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Student has not participated in any recruitment drives yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {applications.map((app) => {
                  const comp = app.companies;
                  const currentRound = app.current_round;
                  const outcomeRound = app.outcome_round;

                  return (
                    <div
                      key={app.id}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'var(--surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {comp?.name || 'Company Drive'}
                          </span>
                          <span className="badge badge-package">{comp?.salary_package}</span>
                          <span className={`badge ${
                            app.status === 'Selected' ? 'badge-selected' :
                            app.status === 'In Process' ? 'badge-in-process' :
                            app.status === 'Rejected' ? 'badge-rejected' : 'badge-did-not-apply'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {app.status === 'In Process' && (
                            <span>Currently in: {currentRound ? `Round ${currentRound.round_number} (${currentRound.round_type})` : 'Application Submitted'}</span>
                          )}
                          {app.status === 'Selected' && (
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                              Selected in: {outcomeRound ? outcomeRound.round_type : 'Final Round'} {app.outcome_date ? `on ${app.outcome_date}` : ''}
                            </span>
                          )}
                          {app.status === 'Rejected' && (
                            <span style={{ color: 'var(--danger)' }}>
                              Eliminated at: {outcomeRound ? `Round ${outcomeRound.round_number} (${outcomeRound.round_type})` : 'Review stage'}
                            </span>
                          )}
                          {app.status === 'Did Not Apply' && (
                            <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                              Opted out: "{app.not_applied_reason || 'Reason not logged'}"
                            </span>
                          )}
                        </div>

                        {app.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Mentor Remarks: {app.notes}
                          </div>
                        )}
                      </div>

                      {onSelectCompany && comp && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectCompany(comp.id);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <Building2 size={13} />
                          <span>View Drive</span>
                        </button>
                      )}
                    </div>
                  );
                })}
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
    </div>
  );
}
