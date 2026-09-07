// =========================================================
// Placement Management Portal (PMP) - Unified API Layer
// Re-exports pure Supabase modular services
// =========================================================

export {
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange
} from './authService';

export {
  sanitizeStudent,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUpsertStudents
} from './studentsService';

export {
  sanitizeCompany,
  evaluateStudentEligibility,
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyRounds
} from './companiesService';

export {
  getCompanyApplications,
  getStudentApplications,
  saveApplication,
  deleteApplication,
  bulkSaveApplications
} from './applicationsService';

export {
  getDriveLinks,
  createDriveLink,
  updateDriveLink,
  deleteDriveLink
} from './driveLinksService';

export {
  getDashboardData
} from './dashboardService';
