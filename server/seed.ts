import db, { initDatabase } from './database';
import { fileURLToPath } from 'url';

export function seedDatabase() {
  initDatabase();

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, employeeCode, username, firstName, lastName, officialEmail, role, department, position, joinDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertClient = db.prepare(`
    INSERT OR IGNORE INTO clients (id, clientName, companyName, clientType, industry, primaryContactName, officialEmail, phone, address, accountOwnerId, source, engagementType, contractStartDate, paymentTerms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertProject = db.prepare(`
    INSERT OR IGNORE INTO projects (id, clientId, name, description, status, startDate, endDate, managerId, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTask = db.prepare(`
    INSERT OR IGNORE INTO tasks (id, projectId, title, description, status, priority, dueDate, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTaskAssignment = db.prepare(`
    INSERT OR IGNORE INTO task_assignments (taskId, userId) VALUES (?, ?)
  `);

  const insertInvoice = db.prepare(`
    INSERT OR IGNORE INTO invoices (id, invoiceNumber, clientId, issueDate, dueDate, subtotal, taxTotal, totalAmount, currency, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInvoiceItem = db.prepare(`
    INSERT OR IGNORE INTO invoice_items (id, invoiceId, description, quantity, unitPrice, taxRate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPayment = db.prepare(`
    INSERT OR IGNORE INTO payments (id, invoiceId, amount, date, type, method, reference, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExpense = db.prepare(`
    INSERT OR IGNORE INTO expenses (id, title, amount, category, type, date, status, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    // 3 Employees
    insertUser.run('usr_1', 'EMP001', 'admin', 'Super', 'Admin', 'admin@erp.com', 'super_admin', 'Management', 'CEO', '2023-01-01');
    insertUser.run('usr_2', 'EMP002', 'jdoe', 'John', 'Doe', 'john@erp.com', 'project_manager', 'Engineering', 'Project Manager', '2023-02-01');
    insertUser.run('usr_3', 'EMP003', 'asmith', 'Alice', 'Smith', 'alice@erp.com', 'developer', 'Engineering', 'Senior Dev', '2023-03-01');

    // 3 Clients
    insertClient.run('cli_1', 'Acme Corp', 'Acme Corporation', 'enterprise', 'Technology', 'Bob Ross', 'bob@acme.com', '1234567890', '123 Tech St', 'usr_1', 'direct', 'project', '2023-05-01', 'monthly');
    insertClient.run('cli_2', 'Globex', 'Globex Inc', 'business', 'Manufacturing', 'Homer S', 'homer@globex.com', '0987654321', '456 Factory Rd', 'usr_1', 'referral', 'retainer', '2023-06-01', 'advance');
    insertClient.run('cli_3', 'Initech', 'Initech LLC', 'business', 'Software', 'Bill L', 'bill@initech.com', '5551234567', '789 Office Park', 'usr_1', 'website', 'project', '2023-07-01', 'milestone');

    // 3 Projects
    insertProject.run('prj_1', 'cli_1', 'Acme Website Revamp', 'Redesign and rebuild the corporate website', 'active', '2023-08-01', '2023-12-31', 'usr_2', 30);
    insertProject.run('prj_2', 'cli_2', 'Globex ERP Integration', 'Integrate legacy systems with new ERP', 'active', '2023-09-01', '2024-03-31', 'usr_2', 10);
    insertProject.run('prj_3', 'cli_3', 'Initech Mobile App', 'Develop iOS and Android apps', 'active', '2023-10-01', '2024-06-30', 'usr_2', 50);

    // 6 Tasks
    insertTask.run('tsk_1', 'prj_1', 'Design Mockups', 'Create Figma mockups for homepage', 'done', 'high', '2023-08-15', 'usr_2');
    insertTaskAssignment.run('tsk_1', 'usr_3');
    
    insertTask.run('tsk_2', 'prj_1', 'Frontend Development', 'Implement React components', 'in-progress', 'high', '2023-09-30', 'usr_2');
    insertTaskAssignment.run('tsk_2', 'usr_3');

    insertTask.run('tsk_3', 'prj_2', 'API Design', 'Design REST APIs for integration', 'todo', 'medium', '2023-10-15', 'usr_2');
    insertTaskAssignment.run('tsk_3', 'usr_3');

    insertTask.run('tsk_4', 'prj_2', 'Database Migration', 'Migrate old data to new schema', 'todo', 'high', '2023-11-01', 'usr_2');
    insertTaskAssignment.run('tsk_4', 'usr_3');

    insertTask.run('tsk_5', 'prj_3', 'UI/UX Design', 'Design mobile app screens', 'done', 'medium', '2023-10-15', 'usr_2');
    insertTaskAssignment.run('tsk_5', 'usr_3');

    insertTask.run('tsk_6', 'prj_3', 'React Native Setup', 'Initialize project and navigation', 'in-progress', 'high', '2023-11-01', 'usr_2');
    insertTaskAssignment.run('tsk_6', 'usr_3');

    // 3 Invoices
    insertInvoice.run('inv_1', 'INV-2023-001', 'cli_1', '2023-08-01', '2023-08-15', 5000, 500, 5500, 'USD', 'paid');
    insertInvoiceItem.run('inv_item_1', 'inv_1', 'Website Design Advance', 1, 5000, 10, 5000);

    insertInvoice.run('inv_2', 'INV-2023-002', 'cli_2', '2023-09-01', '2023-09-15', 10000, 1000, 11000, 'USD', 'paid');
    insertInvoiceItem.run('inv_item_2', 'inv_2', 'ERP Integration Retainer', 1, 10000, 10, 10000);

    insertInvoice.run('inv_3', 'INV-2023-003', 'cli_3', '2023-10-01', '2023-10-15', 15000, 1500, 16500, 'USD', 'draft');
    insertInvoiceItem.run('inv_item_3', 'inv_3', 'Mobile App Milestone 1', 1, 15000, 10, 15000);

    // 3 Payments
    insertPayment.run('pay_1', 'inv_1', 5500, '2023-08-10', 'income', 'bank_transfer', 'TXN001', 'completed');
    insertPayment.run('pay_2', 'inv_2', 11000, '2023-09-12', 'income', 'credit_card', 'TXN002', 'completed');
    insertPayment.run('pay_3', 'inv_3', 5000, '2023-10-05', 'income', 'bank_transfer', 'TXN003', 'completed'); // Partial payment

    // Sample Expenses
    insertExpense.run('exp_1', 'Office Rent', 2000, 'rent', 'recurring', '2023-10-01', 'paid', 'usr_1');
    insertExpense.run('exp_2', 'AWS Hosting', 500, 'software', 'recurring', '2023-10-05', 'paid', 'usr_1');
    insertExpense.run('exp_3', 'Team Lunch', 150, 'other', 'one-time', '2023-10-10', 'approved', 'usr_1');

  })();

  console.log('Database seeded successfully.');
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
