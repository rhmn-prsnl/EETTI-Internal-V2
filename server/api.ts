import express from 'express';
import db from './database';

const router = express.Router();

// Generic GET all
router.get('/:table', (req, res) => {
  const { table } = req.params;
  const allowedTables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'payments', 'expenses', 'resumes', 'quotations', 'attendance', 'leave_requests', 'payroll'];
  
  if (!allowedTables.includes(table)) {
    return res.status(404).json({ error: 'Table not found' });
  }

  try {
    let items = db.prepare(`SELECT * FROM ${table}`).all();
    
    // Attach relations for specific tables
    if (table === 'projects') {
      const teamMembers = db.prepare(`SELECT * FROM project_team_members`).all();
      items = items.map((project: any) => ({
        ...project,
        teamMemberIds: teamMembers.filter((tm: any) => tm.projectId === project.id).map((tm: any) => tm.userId)
      }));
    } else if (table === 'tasks') {
      const assignments = db.prepare(`SELECT * FROM task_assignments`).all();
      items = items.map((task: any) => ({
        ...task,
        assignedTo: assignments.filter((a: any) => a.taskId === task.id).map((a: any) => a.userId)
      }));
    } else if (table === 'invoices') {
      const invoiceItems = db.prepare(`SELECT * FROM invoice_items`).all();
      items = items.map((invoice: any) => ({
        ...invoice,
        items: invoiceItems.filter((i: any) => i.invoiceId === invoice.id)
      }));
    } else if (table === 'quotations') {
      const quotationItems = db.prepare(`SELECT * FROM quotation_items`).all();
      items = items.map((quotation: any) => ({
        ...quotation,
        items: quotationItems.filter((i: any) => i.quotationId === quotation.id)
      }));
    } else if (table === 'resumes') {
      const skills = db.prepare(`SELECT * FROM resume_skills`).all();
      const moms = db.prepare(`SELECT * FROM resume_moms`).all();
      items = items.map((resume: any) => ({
        ...resume,
        skills: skills.filter((s: any) => s.resumeId === resume.id).map((s: any) => s.skill),
        moms: moms.filter((m: any) => m.resumeId === resume.id),
        history: []
      }));
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Generic POST
router.post('/:table', (req, res) => {
  const { table } = req.params;
  const allowedTables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'payments', 'expenses', 'resumes', 'quotations', 'attendance', 'leave_requests', 'payroll'];
  
  if (!allowedTables.includes(table)) {
    return res.status(404).json({ error: 'Table not found' });
  }

  try {
    const data = req.body;
    
    // Handle special cases with relations
    if (table === 'tasks') {
      const { assignedTo, ...taskData } = data;
      const keys = Object.keys(taskData);
      const values = Object.values(taskData);
      const placeholders = keys.map(() => '?').join(', ');
      
      db.transaction(() => {
        db.prepare(`INSERT INTO tasks (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
        if (assignedTo && Array.isArray(assignedTo)) {
          const insertAssignment = db.prepare(`INSERT INTO task_assignments (taskId, userId) VALUES (?, ?)`);
          assignedTo.forEach(userId => insertAssignment.run(taskData.id, userId));
        }
      })();
      return res.status(201).json({ success: true, id: taskData.id });
    }
    
    if (table === 'invoices') {
      const { items, ...invoiceData } = data;
      const keys = Object.keys(invoiceData);
      const values = Object.values(invoiceData);
      const placeholders = keys.map(() => '?').join(', ');
      
      db.transaction(() => {
        db.prepare(`INSERT INTO invoices (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
        if (items && Array.isArray(items)) {
          const insertItem = db.prepare(`INSERT INTO invoice_items (id, invoiceId, description, quantity, unitPrice, taxRate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)`);
          items.forEach(item => insertItem.run(item.id || `inv_item_${Date.now()}_${Math.random()}`, invoiceData.id, item.description, item.quantity, item.unitPrice, item.taxRate, item.amount));
        }
      })();
      return res.status(201).json({ success: true, id: invoiceData.id });
    }

    if (table === 'quotations') {
      const { items, ...quotationData } = data;
      const keys = Object.keys(quotationData);
      const values = Object.values(quotationData);
      const placeholders = keys.map(() => '?').join(', ');
      
      db.transaction(() => {
        db.prepare(`INSERT INTO quotations (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
        if (items && Array.isArray(items)) {
          const insertItem = db.prepare(`INSERT INTO quotation_items (id, quotationId, description, quantity, unitPrice, taxRate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)`);
          items.forEach(item => insertItem.run(item.id || `qt_item_${Date.now()}_${Math.random()}`, quotationData.id, item.description, item.quantity, item.unitPrice, item.taxRate, item.amount));
        }
      })();
      return res.status(201).json({ success: true, id: quotationData.id });
    }

    if (table === 'projects') {
      const { teamMemberIds, ...projectData } = data;
      const keys = Object.keys(projectData);
      const values = Object.values(projectData);
      const placeholders = keys.map(() => '?').join(', ');
      
      db.transaction(() => {
        db.prepare(`INSERT INTO projects (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
        if (teamMemberIds && Array.isArray(teamMemberIds)) {
          const insertTeamMember = db.prepare(`INSERT INTO project_team_members (projectId, userId) VALUES (?, ?)`);
          teamMemberIds.forEach(userId => insertTeamMember.run(projectData.id, userId));
        }
      })();
      return res.status(201).json({ success: true, id: projectData.id });
    }

    // Default insert
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
    
    res.status(201).json({ success: true, id: data.id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Generic PUT
router.put('/:table/:id', (req, res) => {
  const { table, id } = req.params;
  const allowedTables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'payments', 'expenses', 'resumes', 'quotations', 'attendance', 'leave_requests', 'payroll'];
  
  if (!allowedTables.includes(table)) {
    return res.status(404).json({ error: 'Table not found' });
  }

  try {
    const data = req.body;
    
    if (table === 'tasks') {
      const { assignedTo, ...taskData } = data;
      const keys = Object.keys(taskData).filter(k => k !== 'id');
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => taskData[k]);
      
      db.transaction(() => {
        if (keys.length > 0) {
          db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`).run(...values, id);
        }
        if (assignedTo && Array.isArray(assignedTo)) {
          db.prepare(`DELETE FROM task_assignments WHERE taskId = ?`).run(id);
          const insertAssignment = db.prepare(`INSERT INTO task_assignments (taskId, userId) VALUES (?, ?)`);
          assignedTo.forEach(userId => insertAssignment.run(id, userId));
        }
      })();
      return res.json({ success: true });
    }

    if (table === 'invoices') {
      const { items, ...invoiceData } = data;
      const keys = Object.keys(invoiceData).filter(k => k !== 'id');
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => invoiceData[k]);
      
      db.transaction(() => {
        if (keys.length > 0) {
          db.prepare(`UPDATE invoices SET ${setClause} WHERE id = ?`).run(...values, id);
        }
        if (items && Array.isArray(items)) {
          db.prepare(`DELETE FROM invoice_items WHERE invoiceId = ?`).run(id);
          const insertItem = db.prepare(`INSERT INTO invoice_items (id, invoiceId, description, quantity, unitPrice, taxRate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)`);
          items.forEach(item => insertItem.run(item.id || `inv_item_${Date.now()}_${Math.random()}`, id, item.description, item.quantity, item.unitPrice, item.taxRate, item.amount));
        }
      })();
      return res.json({ success: true });
    }
    
    if (table === 'quotations') {
      const { items, ...quotationData } = data;
      const keys = Object.keys(quotationData).filter(k => k !== 'id');
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => quotationData[k]);
      
      db.transaction(() => {
        if (keys.length > 0) {
          db.prepare(`UPDATE quotations SET ${setClause} WHERE id = ?`).run(...values, id);
        }
        if (items && Array.isArray(items)) {
          db.prepare(`DELETE FROM quotation_items WHERE quotationId = ?`).run(id);
          const insertItem = db.prepare(`INSERT INTO quotation_items (id, quotationId, description, quantity, unitPrice, taxRate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)`);
          items.forEach(item => insertItem.run(item.id || `qt_item_${Date.now()}_${Math.random()}`, id, item.description, item.quantity, item.unitPrice, item.taxRate, item.amount));
        }
      })();
      return res.json({ success: true });
    }

    if (table === 'projects') {
      const { teamMemberIds, ...projectData } = data;
      const keys = Object.keys(projectData).filter(k => k !== 'id');
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const values = keys.map(k => projectData[k]);
      
      db.transaction(() => {
        if (keys.length > 0) {
          db.prepare(`UPDATE projects SET ${setClause} WHERE id = ?`).run(...values, id);
        }
        if (teamMemberIds && Array.isArray(teamMemberIds)) {
          db.prepare(`DELETE FROM project_team_members WHERE projectId = ?`).run(id);
          const insertTeamMember = db.prepare(`INSERT INTO project_team_members (projectId, userId) VALUES (?, ?)`);
          teamMemberIds.forEach(userId => insertTeamMember.run(id, userId));
        }
      })();
      return res.json({ success: true });
    }

    // Default update
    const keys = Object.keys(data).filter(k => k !== 'id');
    if (keys.length === 0) return res.json({ success: true });
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => data[k]);
    
    db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values, id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Generic DELETE
router.delete('/:table/:id', (req, res) => {
  const { table, id } = req.params;
  const allowedTables = ['users', 'clients', 'projects', 'tasks', 'invoices', 'payments', 'expenses', 'resumes', 'quotations', 'attendance', 'leave_requests', 'payroll'];
  
  if (!allowedTables.includes(table)) {
    return res.status(404).json({ error: 'Table not found' });
  }

  try {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
