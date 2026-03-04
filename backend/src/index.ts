import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // Allow all origins for simplicity in shared hosting
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// --- REAL-TIME EVENT HANDLERS ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId); // User joins their own private channel
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// --- API ROUTES ---

// 1. AUTH
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    
    // Parse JSON fields before sending
    const userData = {
      ...user,
      internDetails: user.internDetails ? JSON.parse(user.internDetails as string) : undefined,
      preferences: user.preferences ? JSON.parse(user.preferences as string) : undefined
    };
    
    res.json({ token, user: userData });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. DASHBOARD DATA (Aggregated)
app.get('/api/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ targetUserIds: 'all' }, { targetUserIds: { contains: userId } }]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Fetch Tasks
    const tasks = await prisma.task.findMany({
      where: { assignees: { some: { id: userId } } },
      include: { project: true }
    });

    res.json({ notifications, tasks });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 3. TASKS (Real-time updates)
app.post('/api/tasks', async (req, res) => {
  const data = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        project: { connect: { id: data.projectId } },
        assignees: { connect: data.assignedTo.map((id: string) => ({ id })) }
      },
      include: { assignees: true }
    });

    // REAL-TIME NOTIFY
    io.emit('task_update', { type: 'create', task });
    
    // Notify Assignees
    task.assignees.forEach(u => {
      io.to(u.id).emit('notification', {
        title: 'New Task Assigned',
        message: `You have been assigned to ${task.title}`,
        type: 'info'
      });
    });

    res.json(task);
  } catch (e) {
    res.status(500).json({ error: 'Could not create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: updates,
      include: { assignees: true }
    });
    
    // REAL-TIME BROADCAST
    io.emit('task_update', { type: 'update', task });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// 4. USERS (Simple Fetch)
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
