import io from 'socket.io-client';

// Change this to your Hostinger Domain when deploying (e.g., https://api.yourdomain.com)
const API_URL = 'http://localhost:5000'; 

export const socket = io(API_URL);

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  // Dashboard Data
  getDashboardData: async (userId: string) => {
    const res = await fetch(`${API_URL}/api/dashboard/${userId}`);
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_URL}/api/users`);
    return res.json();
  },

  // Tasks
  updateTask: async (taskId: string, updates: any) => {
    const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  }
};
