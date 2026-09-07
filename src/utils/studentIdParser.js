/**
 * Modular Student Unique ID Parser & Academic Calculator
 * 
 * Format: E0223006
 * E   = Engineering
 * 02  = Department Code (02: Cybersecurity and IoT)
 * 23  = Joining Year (2023)
 * 006 = Roll Number (Student 6)
 * 
 * Future departments can be registered in DEPARTMENT_REGISTRY.
 */

export const DEPARTMENT_REGISTRY = {
  '02': {
    code: '02',
    name: 'Cybersecurity and IoT',
    faculty: 'Engineering',
    durationYears: 4
  }
};

/**
 * Calculates current academic year and semester based on joining year and reference date.
 * Academic year schedule:
 * - Odd Semester (Sem 1, 3, 5, 7): July - December
 * - Even Semester (Sem 2, 4, 6, 8): January - June
 * 
 * @param {number} joiningYear Full year e.g. 2023
 * @param {Date} [referenceDate] Optional reference date (defaults to current date)
 */
export function calculateAcademicStatus(joiningYear, referenceDate = new Date()) {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1 to 12

  // Determine academic progression
  let academicYearNum = 0;
  let semesterNum = 0;
  let isOddSem = currentMonth >= 7;

  if (isOddSem) {
    // July to December
    academicYearNum = currentYear - joiningYear + 1;
    semesterNum = (academicYearNum - 1) * 2 + 1;
  } else {
    // January to June
    academicYearNum = currentYear - 1 - joiningYear + 1;
    semesterNum = academicYearNum * 2;
  }

  if (academicYearNum > 4) {
    return {
      academicYear: academicYearNum,
      semester: semesterNum,
      isGraduated: true,
      yearText: 'Graduated / Alumni',
      semesterText: 'Completed',
      displayTag: 'Graduated'
    };
  }

  if (academicYearNum < 1) {
    return {
      academicYear: 1,
      semester: 1,
      isGraduated: false,
      yearText: 'Incoming / 1st Year',
      semesterText: 'Semester 1',
      displayTag: '1st Year • Sem 1'
    };
  }

  const ordinalMap = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
  const yearText = ordinalMap[academicYearNum] || `${academicYearNum}th Year`;
  const semesterText = `Semester ${semesterNum}`;

  return {
    academicYear: academicYearNum,
    semester: semesterNum,
    isGraduated: false,
    yearText,
    semesterText,
    displayTag: `${yearText} • ${semesterText}`
  };
}

/**
 * Parses and validates a student Unique ID.
 * Supports format: E02YYNNN (case insensitive)
 * 
 * @param {string} rawId The student ID string
 * @param {Date} [referenceDate] Optional reference date for academic calculation
 */
export function parseStudentId(rawId, referenceDate = new Date()) {
  if (!rawId || typeof rawId !== 'string') {
    return {
      isValid: false,
      error: 'Student Unique ID is required.'
    };
  }

  const cleanId = rawId.trim().toUpperCase();
  // Regex: Prefix E, 2-digit Dept Code, 2-digit Year, 3-digit Roll No
  const idRegex = /^E(\d{2})(\d{2})(\d{3})$/;
  const match = cleanId.match(idRegex);

  if (!match) {
    return {
      isValid: false,
      cleanId,
      error: 'Invalid format. Must follow E02YYNNN (e.g. E0223006).'
    };
  }

  const [, deptCode, yearShort, rollStr] = match;

  // Department check - Currently strictly Cybersecurity and IoT ('02')
  const deptInfo = DEPARTMENT_REGISTRY[deptCode];
  if (!deptInfo) {
    return {
      isValid: false,
      cleanId,
      error: `Department code '${deptCode}' is not recognized. Only '02' (Cybersecurity and IoT) is supported.`
    };
  }

  const joiningYear = 2000 + parseInt(yearShort, 10);
  const rollNumber = parseInt(rollStr, 10);
  const endYear = joiningYear + (deptInfo.durationYears || 4);
  const batch = `${joiningYear}–${endYear}`;

  const academicStatus = calculateAcademicStatus(joiningYear, referenceDate);

  return {
    isValid: true,
    cleanId,
    department: deptInfo.name,
    departmentCode: deptCode,
    faculty: deptInfo.faculty,
    joiningYear,
    batch,
    rollNumber,
    rollNumberFormatted: rollStr,
    academicStatus,
    summary: `${deptInfo.name} • Batch ${batch} • Roll ${rollNumber}`
  };
}
