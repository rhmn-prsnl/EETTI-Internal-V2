-- Core Tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  employeeCode TEXT UNIQUE,
  username TEXT UNIQUE,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  officialEmail TEXT UNIQUE NOT NULL,
  mobileNumber TEXT,
  status TEXT DEFAULT 'active',
  role TEXT NOT NULL,
  department TEXT,
  position TEXT,
  joinDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  clientName TEXT NOT NULL,
  companyName TEXT NOT NULL,
  clientType TEXT,
  industry TEXT,
  status TEXT DEFAULT 'active',
  primaryContactName TEXT,
  officialEmail TEXT,
  phone TEXT,
  address TEXT,
  accountOwnerId TEXT,
  source TEXT,
  engagementType TEXT,
  contractStartDate TEXT,
  paymentTerms TEXT,
  currency TEXT DEFAULT 'USD',
  riskLevel TEXT DEFAULT 'low',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (accountOwnerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  clientId TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  startDate TEXT,
  endDate TEXT,
  managerId TEXT,
  progress INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES clients(id),
  FOREIGN KEY (managerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS project_team_members (
  projectId TEXT,
  userId TEXT,
  PRIMARY KEY (projectId, userId),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  dueDate TEXT,
  createdBy TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_assignments (
  taskId TEXT,
  userId TEXT,
  PRIMARY KEY (taskId, userId),
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoiceNumber TEXT UNIQUE NOT NULL,
  clientId TEXT NOT NULL,
  issueDate TEXT,
  dueDate TEXT,
  subtotal REAL DEFAULT 0,
  taxTotal REAL DEFAULT 0,
  totalAmount REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  isRecurring BOOLEAN DEFAULT 0,
  templateId TEXT DEFAULT 'modern',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoiceId TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  unitPrice REAL DEFAULT 0,
  taxRate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoiceId TEXT,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  type TEXT DEFAULT 'income',
  method TEXT,
  reference TEXT,
  status TEXT DEFAULT 'completed',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT,
  type TEXT DEFAULT 'one-time',
  date TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  createdBy TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotationNumber TEXT UNIQUE NOT NULL,
  clientId TEXT NOT NULL,
  issueDate TEXT,
  validUntil TEXT,
  subtotal REAL DEFAULT 0,
  taxTotal REAL DEFAULT 0,
  totalAmount REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id TEXT PRIMARY KEY,
  quotationId TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  unitPrice REAL DEFAULT 0,
  taxRate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  FOREIGN KEY (quotationId) REFERENCES quotations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT,
  checkIn TEXT,
  checkOut TEXT,
  totalHours REAL DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  type TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  adminComment TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payroll (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basicSalary REAL DEFAULT 0,
  allowances REAL DEFAULT 0,
  deductions REAL DEFAULT 0,
  netSalary REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paymentDate TEXT,
  generatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  candidateName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  experience REAL DEFAULT 0,
  status TEXT DEFAULT 'new',
  resumeUrl TEXT,
  appliedPosition TEXT,
  source TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resume_skills (
  resumeId TEXT,
  skill TEXT,
  PRIMARY KEY (resumeId, skill),
  FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resume_moms (
  id TEXT PRIMARY KEY,
  resumeId TEXT NOT NULL,
  date TEXT NOT NULL,
  interviewer TEXT NOT NULL,
  notes TEXT,
  decision TEXT,
  FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewer) REFERENCES users(id)
);
