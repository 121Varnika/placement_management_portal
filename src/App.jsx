import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/Dashboard/DashboardView';
import MonthlyCalendar from './components/Dashboard/MonthlyCalendar';
import CompanyListView from './components/Companies/CompanyListView';
import CompanyFormModal from './components/Companies/CompanyFormModal';
import CompanyDetailModal from './components/Companies/CompanyDetailModal';
import StudentListView from './components/Students/StudentListView';
import StudentFormModal from './components/Students/StudentFormModal';
import StudentProfileModal from './components/Students/StudentProfileModal';
import StudentCsvImportModal from './components/Students/StudentCsvImportModal';
import DriveLinksView from './components/DriveLinks/DriveLinksView';
import LoginPage from './components/Auth/LoginPage';

import { 
  getCompanies, 
  getCompanyById,
  getStudents, 
  getDashboardData, 
  createCompany, 
  updateCompany, 
  deleteCompany, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  bulkUpsertStudents,
  getCompanyRounds,
  getDriveLinks,
  createDriveLink,
  updateDriveLink,
  deleteDriveLink,
  getSession,
  signOut,
  onAuthStateChange
} from './services/api';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data
  const [dashboardData, setDashboardData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [driveLinks, setDriveLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingCompanyRounds, setEditingCompanyRounds] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Listen for Supabase Authentication State
  useEffect(() => {
    let mounted = true;

    getSession().then((session) => {
      if (mounted) {
        setCurrentUser(session?.user || null);
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (mounted) {
        setCurrentUser(session?.user || null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      showToast('Successfully signed out');
    } catch (err) {
      alert('Sign out error: ' + err.message);
    }
  };

  // Fetch all core data from Supabase
  const refreshAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [dash, comps, stds, dLinks] = await Promise.all([
        getDashboardData(),
        getCompanies(),
        getStudents(),
        getDriveLinks()
      ]);
      setDashboardData(dash);
      setCompanies(comps);
      setStudents(stds);
      setDriveLinks(dLinks || []);

      if (selectedCompanyId) {
        const found = comps.find((c) => c.id === selectedCompanyId);
        setSelectedCompany(found || null);
      }
    } catch (e) {
      console.error('Failed to load portal data from Supabase', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedCompanyId]);

  useEffect(() => {
    if (currentUser) {
      refreshAllData();
    }
  }, [currentUser, refreshAllData]);

  // Handle open company detail / Track page
  const handleSelectCompany = async (companyId) => {
    let found = companies.find((c) => c.id === companyId);
    if (!found && companyId) {
      try {
        found = await getCompanyById(companyId);
      } catch (e) {
        console.error('Failed to get company by id', e);
      }
    }
    if (found) {
      setSelectedCompany(found);
      setSelectedCompanyId(companyId);
    }
  };

  // Handle company form open
  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setEditingCompanyRounds([]);
    setShowCompanyForm(true);
  };

  const handleOpenEditCompany = async (comp) => {
    setEditingCompany(comp);
    try {
      const rounds = await getCompanyRounds(comp.id);
      setEditingCompanyRounds(rounds);
    } catch (e) {
      setEditingCompanyRounds([]);
    }
    setShowCompanyForm(true);
  };

  const handleSaveCompany = async (formData, rounds) => {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData, rounds);
        showToast(`Updated company ${formData.name}`);
      } else {
        await createCompany(formData, rounds);
        showToast(`Added new company ${formData.name}`);
      }
      setShowCompanyForm(false);
      setEditingCompany(null);
      await refreshAllData();
    } catch (e) {
      alert('Failed to save company: ' + e.message);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await deleteCompany(companyId);
      showToast('Company deleted successfully');
      if (selectedCompanyId === companyId) {
        setSelectedCompany(null);
        setSelectedCompanyId(null);
      }
      await refreshAllData();
    } catch (e) {
      alert('Failed to delete company: ' + e.message);
    }
  };

  // Handle student form open
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
  };

  const handleOpenEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
  };

  const handleSaveStudent = async (formData) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        showToast(`Updated profile for ${formData.name}`);
      } else {
        await createStudent(formData);
        showToast(`Registered student ${formData.name}`);
      }
      setShowStudentForm(false);
      setEditingStudent(null);
      await refreshAllData();
    } catch (e) {
      alert('Failed to save student: ' + e.message);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteStudent(studentId);
      showToast('Student removed from directory');
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      await refreshAllData();
    } catch (e) {
      alert('Failed to delete student: ' + e.message);
    }
  };

  const handleBulkImportStudents = async (importedStudents, updateExisting) => {
    try {
      await bulkUpsertStudents(importedStudents, updateExisting);
      showToast(`Imported ${importedStudents.length} student records successfully!`);
      await refreshAllData();
    } catch (e) {
      alert('Failed to import students: ' + e.message);
    }
  };

  // Handle Drive Links CRUD
  const handleAddDriveLink = async (formData) => {
    try {
      await createDriveLink(formData);
      showToast(`Drive link "${formData.title}" added successfully`);
      await refreshAllData();
    } catch (e) {
      alert('Failed to add drive link: ' + e.message);
    }
  };

  const handleEditDriveLink = async (id, formData) => {
    try {
      await updateDriveLink(id, formData);
      showToast(`Drive link "${formData.title}" updated successfully`);
      await refreshAllData();
    } catch (e) {
      alert('Failed to update drive link: ' + e.message);
    }
  };

  const handleDeleteDriveLink = async (id) => {
    try {
      await deleteDriveLink(id);
      showToast('Drive link deleted successfully');
      await refreshAllData();
    } catch (e) {
      alert('Failed to delete drive link: ' + e.message);
    }
  };

  // Loading Screen while verifying session
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b1120',
        color: '#f8fafc',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
        }}>
          <span style={{ fontSize: '24px' }}>🎓</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Verifying authorized placement session...
        </div>
      </div>
    );
  }

  // Unauthenticated: Render Login Page
  if (!currentUser) {
    return (
      <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />
    );
  }

  // Authenticated: Render Main Portal
  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontSize: '0.875rem',
          fontWeight: 500,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={{
          totalCompanies: companies.length,
          totalStudents: students.length,
          totalDriveLinks: driveLinks.length
        }}
        user={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
            setSearchQuery(val);
            if (val && activeTab !== 'companies' && activeTab !== 'students') {
              setActiveTab('students');
            }
          }}
          onAddCompany={handleOpenAddCompany}
          onAddStudent={handleOpenAddStudent}
        />

        <main className="content-area">
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              onSelectCompany={handleSelectCompany}
              onNavigateToCompanies={() => setActiveTab('companies')}
              onNavigateToStudents={() => setActiveTab('students')}
            />
          )}

          {/* VIEW: COMPANIES */}
          {activeTab === 'companies' && (
            <CompanyListView
              companies={companies}
              onAddCompany={handleOpenAddCompany}
              onEditCompany={handleOpenEditCompany}
              onDeleteCompany={handleDeleteCompany}
              onSelectCompany={handleSelectCompany}
            />
          )}

          {/* VIEW: STUDENTS */}
          {activeTab === 'students' && (
            <StudentListView
              students={students}
              onAddStudent={handleOpenAddStudent}
              onEditStudent={handleOpenEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onViewProfile={(std) => setSelectedStudent(std)}
              onImportCsv={() => setShowCsvImportModal(true)}
            />
          )}

          {/* VIEW: PLACEMENT CALENDAR */}
          {activeTab === 'calendar' && (
            <div>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Placement & Recruitment Calendar</h1>
                  <p className="page-desc">
                    Interactive schedule of scheduled company assessments, coding rounds, technical interviews, and drive deadlines.
                  </p>
                </div>
              </div>
              <MonthlyCalendar
                events={dashboardData?.calendarEvents || []}
                onSelectCompany={handleSelectCompany}
              />
            </div>
          )}

          {/* VIEW: DRIVE LINKS */}
          {activeTab === 'drive_links' && (
            <DriveLinksView
              links={driveLinks}
              onAddLink={handleAddDriveLink}
              onEditLink={handleEditDriveLink}
              onDeleteLink={handleDeleteDriveLink}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Company Form Modal (Add / Edit) */}
      <CompanyFormModal
        isOpen={showCompanyForm}
        onClose={() => {
          setShowCompanyForm(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        company={editingCompany}
        initialRounds={editingCompanyRounds}
      />

      {/* 2. Company Detail & Candidate Tracking Modal */}
      <CompanyDetailModal
        isOpen={!!selectedCompany}
        company={selectedCompany}
        onClose={() => {
          setSelectedCompany(null);
          setSelectedCompanyId(null);
          refreshAllData();
        }}
        onEdit={(comp) => {
          setSelectedCompany(null);
          handleOpenEditCompany(comp);
        }}
        onViewStudentProfile={(std) => setSelectedStudent(std)}
      />

      {/* 3. Student Form Modal (Add / Edit) */}
      <StudentFormModal
        isOpen={showStudentForm}
        onClose={() => {
          setShowStudentForm(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      {/* 4. Student Profile Modal */}
      <StudentProfileModal
        isOpen={!!selectedStudent}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onEdit={(std) => {
          setSelectedStudent(null);
          handleOpenEditStudent(std);
        }}
        onSelectCompany={(compId) => {
          setSelectedStudent(null);
          handleSelectCompany(compId);
        }}
      />

      {/* 5. CSV Student Import Modal */}
      <StudentCsvImportModal
        isOpen={showCsvImportModal}
        onClose={() => setShowCsvImportModal(false)}
        onImportSuccess={handleBulkImportStudents}
        existingStudents={students}
      />
    </div>
  );
}
