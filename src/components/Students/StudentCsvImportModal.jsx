import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Download, 
  RefreshCw,
  Info
} from 'lucide-react';
import { parseStudentId } from '../../utils/studentIdParser';

export default function StudentCsvImportModal({ 
  isOpen, 
  onClose, 
  onImportSuccess, 
  existingStudents = [] 
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null); // { valid: [], invalid: [], duplicates: [] }
  const [previewTab, setPreviewTab] = useState('valid'); // 'valid' | 'invalid'
  const [updateDuplicates, setUpdateDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Simple CSV text parsing helper supporting quotes and commas
  const parseCSVText = (text) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const splitCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, '').trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, '').trim());
      return result;
    };

    const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      records.push({ rowNumber: i + 1, raw: rowObj });
    }

    return records;
  };

  const handleFileProcess = (uploadedFile) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setParsing(true);
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVText(text);

        const valid = [];
        const invalid = [];
        const seenIdsInCsv = new Set();
        const existingIdMap = new Set(
          existingStudents.map((s) => (s.college_id || '').toUpperCase())
        );

        rows.forEach(({ rowNumber, raw }) => {
          // Normalize header fields
          const name = raw.name || raw.studentname || raw.fullname || '';
          const rawId = raw.uniqueid || raw.collegeid || raw.rollno || raw.id || raw.rollnumber || '';
          const cgpa = raw.cgpa || '0';
          const currentArrears = raw.currentarrears || raw.arrears || '0';
          const clearedArrears = raw.clearedarrears || raw.arrearshistory || raw.cleared || '0';
          const tenth = raw.tenthpercentage || raw.tenth || raw['10th'] || raw['10thpercentage'] || '';
          const twelfth = raw.twelfthpercentage || raw.twelfth || raw['12th'] || raw['12thpercentage'] || raw.diploma || '';
          const email = raw.email || raw.collegeemail || '';
          const personalEmail = raw.personalemail || raw.workpersonalemail || raw.workemail || '';
          const phone = raw.phone || raw.phonenumber || raw.mobile || '';
          const github = raw.github || raw.githuburl || '';
          const linkedin = raw.linkedin || raw.linkedinurl || '';
          const leetcode = raw.leetcode || raw.leetcodeurl || '';
          const portfolio = raw.portfolio || raw.portfoliourl || raw.website || '';
          
          let rawStatus = (raw.placementstatus || raw.status || 'Not Placed').trim();
          // Status normalization: Strictly Placed or Not Placed
          let status = 'Not Placed';
          if (rawStatus.toLowerCase() === 'placed') {
            status = 'Placed';
          }

          // Validation
          const reasons = [];
          if (!name.trim()) {
            reasons.push('Missing student name');
          }

          if (!rawId.trim()) {
            reasons.push('Missing Unique ID');
          }

          const parsedId = parseStudentId(rawId);
          if (!parsedId.isValid) {
            reasons.push(parsedId.error || 'Invalid Unique ID structure');
          }

          const cleanIdUpper = parsedId.isValid ? parsedId.cleanId : rawId.trim().toUpperCase();

          if (seenIdsInCsv.has(cleanIdUpper)) {
            reasons.push(`Duplicate Unique ID '${cleanIdUpper}' within this CSV file`);
          }

          if (reasons.length > 0) {
            invalid.push({
              rowNumber,
              name: name || '—',
              uniqueId: rawId || '—',
              reason: reasons.join(' • ')
            });
          } else {
            seenIdsInCsv.add(cleanIdUpper);
            const isExisting = existingIdMap.has(cleanIdUpper);

            valid.push({
              rowNumber,
              name: name.trim(),
              college_id: cleanIdUpper,
              department: parsedId.department,
              batch: parsedId.batch,
              joiningYear: parsedId.joiningYear,
              academicStatus: parsedId.academicStatus,
              cgpa: parseFloat(cgpa) || 0,
              current_arrears: parseInt(currentArrears, 10) || 0,
              arrears_history: parseInt(clearedArrears, 10) || 0,
              tenth_percentage: parseFloat(tenth) || null,
              twelfth_percentage: parseFloat(twelfth) || null,
              college_email: email.trim(),
              work_personal_email: personalEmail.trim(),
              phone: phone.trim(),
              github_url: github.trim(),
              linkedin_url: linkedin.trim(),
              leetcode_url: leetcode.trim(),
              portfolio_url: portfolio.trim(),
              placement_status: status,
              isDuplicateInDb: isExisting
            });
          }
        });

        setParsedData({
          totalRows: rows.length,
          valid,
          invalid,
          duplicateCount: valid.filter((v) => v.isDuplicateInDb).length
        });
        setPreviewTab(valid.length > 0 ? 'valid' : 'invalid');
      } catch (err) {
        alert('Failed to parse CSV file: ' + err.message);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent = `Name,UniqueID,CGPA,Current Arrears,Cleared Arrears,10th Percentage,12th Percentage,Email,Phone,Placement Status,GitHub,LinkedIn,LeetCode
Vigneshwaran M,E0223007,8.65,0,0,91.2,88.4,vignesh.m@college.edu,+91 98765 43220,Not Placed,https://github.com/vignesh,https://linkedin.com/in/vignesh,https://leetcode.com/vignesh
Harini S,E0223008,9.20,0,0,95.0,92.5,harini.s@college.edu,+91 98765 43221,Placed,https://github.com/harini,https://linkedin.com/in/harini,https://leetcode.com/harini
Deepak Kumar,E0223009,7.45,1,1,84.0,81.0,deepak.k@college.edu,+91 98765 43222,Not Placed,,,`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pmp_students_cybersecurity_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = async () => {
    if (!parsedData || parsedData.valid.length === 0) return;
    setImporting(true);
    try {
      await onImportSuccess(parsedData.valid, updateDuplicates);
      onClose();
    } catch (err) {
      alert('Error saving imported students: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-large" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={22} color="var(--primary)" />
            <div>
              <h3 className="modal-title" style={{ margin: 0 }}>Import Students Database (CSV)</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Cybersecurity & IoT Department • Auto-derives Department, Joining Year, Batch & Semester
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Format Requirements Alert */}
          <div style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} color="var(--primary)" />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Unique ID Requirement:</strong> IDs must match <code>E02YYNNN</code> (e.g. <code>E0223006</code>).
                Department (Cybersecurity & IoT), Joining Year (2023), Batch (2023–2027), and Current Semester are derived automatically.
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleDownloadTemplate} 
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              <Download size={14} />
              <span>Download Template</span>
            </button>
          </div>

          {/* Drag & Drop Box */}
          {!parsedData && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-color)'}`,
                backgroundColor: isDragging ? 'var(--primary-light)' : '#f8fafc',
                borderRadius: '12px',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <UploadCloud size={40} color={isDragging ? 'var(--primary)' : '#94a3b8'} style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {file ? file.name : 'Click to select or drag and drop a student CSV file'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Supports standard comma-separated .csv files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}

          {parsing && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <div>Validating student records and Unique IDs...</div>
            </div>
          )}

          {/* Validation & Preview Screen */}
          {parsedData && (
            <div>
              {/* Summary Metrics Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ padding: '10px 14px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total CSV Rows
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {parsedData.totalRows}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Valid Records
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>
                    {parsedData.valid.length}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: parsedData.invalid.length > 0 ? 'var(--danger-bg)' : '#f8fafc', border: `1px solid ${parsedData.invalid.length > 0 ? 'var(--danger-border)' : 'var(--border-color)'}`, borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: parsedData.invalid.length > 0 ? 'var(--danger)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Rejected Rows
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: parsedData.invalid.length > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {parsedData.invalid.length}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Existing in DB
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706' }}>
                    {parsedData.duplicateCount}
                  </div>
                </div>
              </div>

              {/* Duplicate Handling Option */}
              {parsedData.duplicateCount > 0 && (
                <div style={{
                  padding: '10px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#92400e' }}>
                    <AlertTriangle size={16} />
                    <span>{parsedData.duplicateCount} students already exist with matching Unique IDs.</span>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#78350f' }}>
                    <input
                      type="checkbox"
                      checked={updateDuplicates}
                      onChange={(e) => setUpdateDuplicates(e.target.checked)}
                    />
                    <span>Update existing records with new CSV data</span>
                  </label>
                </div>
              )}

              {/* Preview Navigation Tabs */}
              <div className="tab-list">
                <button
                  type="button"
                  className={`tab-btn ${previewTab === 'valid' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('valid')}
                >
                  <CheckCircle2 size={15} color="var(--success)" />
                  <span>Valid Records to Import ({parsedData.valid.length})</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${previewTab === 'invalid' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('invalid')}
                >
                  <AlertCircle size={15} color={parsedData.invalid.length > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
                  <span>Rejected Records ({parsedData.invalid.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setFile(null);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: 'auto' }}
                >
                  <RefreshCw size={13} />
                  <span>Choose Another File</span>
                </button>
              </div>

              {/* Tab 1: Valid Records */}
              {previewTab === 'valid' && (
                <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {parsedData.valid.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No valid records found in the uploaded file.
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Unique ID</th>
                          <th>Student Name</th>
                          <th>Derived Department & Batch</th>
                          <th>Current Status</th>
                          <th>CGPA</th>
                          <th>Arrears</th>
                          <th>Placement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.valid.map((item) => (
                          <tr key={item.college_id}>
                            <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.rowNumber}</td>
                            <td>
                              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                                {item.college_id}
                              </span>
                              {item.isDuplicateInDb && (
                                <span style={{ fontSize: '0.65rem', marginLeft: '6px', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px' }}>
                                  Exists
                                </span>
                              )}
                            </td>
                            <td style={{ fontWeight: 600 }}>{item.name}</td>
                            <td>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{item.department}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Batch {item.batch}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {item.academicStatus.displayTag}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{item.cgpa}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: item.current_arrears > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {item.current_arrears > 0 ? `${item.current_arrears} arrear(s)` : 'Clear'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${item.placement_status === 'Placed' ? 'badge-placed' : 'badge-not-placed'}`}>
                                {item.placement_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab 2: Invalid / Rejected Records */}
              {previewTab === 'invalid' && (
                <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {parsedData.invalid.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--success)' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 8px', color: 'var(--success)' }} />
                      <div style={{ fontWeight: 600 }}>All rows in the CSV passed validation!</div>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Row #</th>
                          <th>Unique ID Entered</th>
                          <th>Name</th>
                          <th>Reason for Rejection</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.invalid.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{item.rowNumber}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{item.uniqueId}</td>
                            <td>{item.name}</td>
                            <td>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                color: 'var(--danger)', 
                                background: 'var(--danger-bg)', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.8rem', 
                                fontWeight: 500 
                              }}>
                                <AlertCircle size={14} />
                                {item.reason}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedData || parsedData.valid.length === 0 || importing}
            className="btn btn-primary"
          >
            {importing ? <RefreshCw size={14} className="spin" /> : <UploadCloud size={15} />}
            <span>
              {importing ? 'Importing Students...' : `Confirm & Import ${parsedData ? parsedData.valid.length : 0} Valid Records`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
