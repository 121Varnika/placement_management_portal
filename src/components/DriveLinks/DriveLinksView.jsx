import React, { useState } from 'react';
import { 
  FolderSymlink, 
  Plus, 
  ExternalLink, 
  Edit, 
  Trash2, 
  X, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function DriveLinksView({ 
  links = [], 
  onAddLink, 
  onEditLink, 
  onDeleteLink 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: ''
  });
  const [urlError, setUrlError] = useState('');

  const filteredLinks = links.filter((link) => {
    const term = searchTerm.toLowerCase();
    return (
      link.title.toLowerCase().includes(term) ||
      (link.description && link.description.toLowerCase().includes(term)) ||
      link.url.toLowerCase().includes(term)
    );
  });

  const handleOpenAdd = () => {
    setEditingLink(null);
    setFormData({ title: '', url: '', description: '' });
    setUrlError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (link) => {
    setEditingLink(link);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      description: link.description || ''
    });
    setUrlError('');
    setModalOpen(true);
  };

  const validateUrl = (string) => {
    try {
      const parsed = new URL(string);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a link title/name.');
      return;
    }

    if (!validateUrl(formData.url.trim())) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (editingLink) {
      onEditLink(editingLink.id, formData);
    } else {
      onAddLink(formData);
    }
    setModalOpen(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Drive Links</h1>
          <p className="page-desc">
            Centralized Google Drive repositories for student resumes, placement guidelines, company brochures, and internship files.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Drive Link</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-input-group">
          <Search className="search-input-icon" size={16} />
          <input
            type="text"
            placeholder="Search by link title, description, or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filteredLinks.length} repository links saved
        </span>
      </div>

      {/* Links List Table / Cards */}
      <div className="table-container">
        {filteredLinks.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FolderSymlink size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>No Drive Links found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Add quick shortcuts to Google Drive folders for resumes, documents, and company materials.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Repository / Document Title</th>
                <th>Google Drive URL</th>
                <th>Description / Purpose</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr key={link.id}>
                  <td>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FolderSymlink size={16} />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                      {link.title}
                    </div>
                  </td>
                  <td>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={link.url}
                    >
                      <span>{link.url}</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
                      {link.description || '—'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="Open Google Drive folder in new tab"
                      >
                        <ExternalLink size={13} />
                        <span>Open Folder</span>
                      </a>

                      <button
                        onClick={() => handleOpenEdit(link)}
                        className="btn-icon-only"
                        title="Edit Drive Link"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the link "${link.title}"?`)) {
                            onDeleteLink(link.id);
                          }
                        }}
                        className="btn-icon-only"
                        title="Delete Drive Link"
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

      {/* Add / Edit Drive Link Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderSymlink size={20} color="var(--primary)" />
                <h3 className="modal-title">
                  {editingLink ? `Edit Drive Link: ${editingLink.title}` : 'Add Google Drive Link'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Link Name / Folder Title <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Student Resumes, Placement Documents"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Google Drive URL <span className="req">*</span>
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={formData.url}
                    onChange={(e) => {
                      setFormData({ ...formData, url: e.target.value });
                      setUrlError('');
                    }}
                    required
                  />
                  {urlError && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
                      {urlError}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Scope</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Optional notes regarding folder contents, permissions, or access links..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingLink ? 'Save Changes' : 'Save Drive Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
