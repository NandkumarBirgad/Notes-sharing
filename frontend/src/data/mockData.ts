export interface StudyMaterial {
  id: string;
  title: string;
  year: number;
  semester: number;
  subject: string;
  type: 'note' | 'paper' | 'video';
  fileFormat?: string;
  url: string;
  downloads: number;
  uploadedAt: string;
  description?: string;
}

export const years = [
  { id: 1, label: '1st Year', description: 'Foundation courses & basics', icon: '📘' },
  { id: 2, label: '2nd Year', description: 'Core subject fundamentals', icon: '📗' },
  { id: 3, label: '3rd Year', description: 'Advanced & elective courses', icon: '📙' },
  { id: 4, label: '4th Year', description: 'Specialization & projects', icon: '📕' },
  { id: 5, label: 'DSA', description: 'Data Structures & Algorithms', icon: '📘' },
];

export const semesters = [
  { id: 1, label: 'Semester 1' },
  { id: 2, label: 'Semester 2' },
  { id: 3, label: 'Semester 3' },
  { id: 4, label: 'Semester 4' },
  { id: 5, label: 'Semester 5' },
  { id: 6, label: 'Semester 6' },
];

export const subjects: Record<string, string[]> = {
  // 1st Year
  '1-1': ['Mathematics 1', 'Basic Electrical Engineering', 'Engineering Graphics', 'Modern Indian Language', 'Physics Applied Science 1'],
  '1-2': ['Mathematics 2', 'PPS (C Language)', 'IT Workshop (HTML, CSS, JavaScript)', 'Chemistry', 'IKS', 'Mechanics'],
  // 2nd Year
  '2-3': ['Mathematics 3', 'Java', 'Data Structures', 'Discrete Mathematics', 'EEE'],
  '2-4': ['CAO', 'DAA', 'Python', 'Signal System', 'E-Business', 'PNS'],
  // 3rd Year
  '3-5': ['DBMS', 'Software Engineering', 'HCI', 'Business Communication', 'Theory of Computation'],
  '3-6': ['Computer Networks', 'Compiler Design', 'Employability Skill Development', 'IoT', 'Machine Learning'],
};

export const mockMaterials: StudyMaterial[] = [
  { id: '1', title: 'Linear Algebra Notes', year: 1, semester: 1, subject: 'Mathematics I', type: 'note', fileFormat: 'PDF', url: '#', downloads: 234, uploadedAt: '2025-12-10', description: 'Complete notes on vectors, matrices, and eigenvalues' },
  { id: '2', title: 'Physics Mid-term 2024', year: 1, semester: 1, subject: 'Physics', type: 'paper', fileFormat: 'PDF', url: '#', downloads: 189, uploadedAt: '2025-11-05', description: 'Mid-semester examination paper with solutions' },
  { id: '3', title: 'C Programming Basics', year: 1, semester: 1, subject: 'Programming in C', type: 'video', url: '#', downloads: 412, uploadedAt: '2025-10-20', description: 'Introduction to C programming fundamentals' },
  { id: '4', title: 'Data Structures Handbook', year: 1, semester: 2, subject: 'Data Structures', type: 'note', fileFormat: 'PDF', url: '#', downloads: 567, uploadedAt: '2025-09-15', description: 'Arrays, linked lists, trees, and graphs' },
  { id: '5', title: 'DBMS Complete Notes', year: 2, semester: 1, subject: 'Database Management', type: 'note', fileFormat: 'DOC', url: '#', downloads: 321, uploadedAt: '2025-08-22', description: 'Relational algebra, SQL, normalization' },
  { id: '6', title: 'OS Final Exam 2024', year: 2, semester: 1, subject: 'Operating Systems', type: 'paper', fileFormat: 'PDF', url: '#', downloads: 276, uploadedAt: '2025-07-18', description: 'End-semester examination paper' },
  { id: '7', title: 'OOP with Java Tutorial', year: 2, semester: 1, subject: 'Object-Oriented Programming', type: 'video', url: '#', downloads: 498, uploadedAt: '2025-06-30', description: 'Complete Java OOP concepts' },
  { id: '8', title: 'CN Lecture Slides', year: 2, semester: 2, subject: 'Computer Networks', type: 'note', fileFormat: 'PPT', url: '#', downloads: 345, uploadedAt: '2025-05-12', description: 'OSI model, TCP/IP, routing protocols' },
  { id: '9', title: 'ML Algorithms Guide', year: 3, semester: 1, subject: 'Machine Learning', type: 'note', fileFormat: 'PDF', url: '#', downloads: 612, uploadedAt: '2025-04-08', description: 'Regression, classification, clustering' },
  { id: '10', title: 'AI Mid-term 2024', year: 3, semester: 2, subject: 'Artificial Intelligence', type: 'paper', fileFormat: 'PDF', url: '#', downloads: 198, uploadedAt: '2025-03-25', description: 'Search algorithms, knowledge representation' },
  { id: '11', title: 'Deep Learning Intro', year: 4, semester: 1, subject: 'Deep Learning', type: 'video', url: '#', downloads: 387, uploadedAt: '2025-02-14', description: 'Neural networks, CNNs, RNNs' },
  { id: '12', title: 'Blockchain Fundamentals', year: 3, semester: 2, subject: 'Blockchain', type: 'note', fileFormat: 'PDF', url: '#', downloads: 156, uploadedAt: '2025-01-30', description: 'Distributed ledger, consensus mechanisms' },
];
