import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { AuthState, User } from './types';

// Mock users removed

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  // Apply theme when user preference changes
  useEffect(() => {
    if (auth.user?.preferences?.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark if undefined or explicitly dark
      document.documentElement.classList.add('dark');
    }
  }, [auth.user?.preferences?.theme]);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('Response is not valid JSON');
        }
      })
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const handleLogin = async (username: string, password?: string, setError?: (msg: string) => void) => {
    let currentUsers = users;
    
    if (currentUsers.length === 0) {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        currentUsers = JSON.parse(text);
        setUsers(currentUsers);
      } catch (err) {
        console.error('Failed to fetch users during login:', err);
      }
    }

    const user = currentUsers.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      (u.officialEmail && u.officialEmail.toLowerCase() === username.toLowerCase())
    );
    
    if (user && password === '123456') {
      setAuth({
        isAuthenticated: true,
        user: {
          ...user,
          lastLogin: new Date().toLocaleString(),
        },
      });
    } else {
      console.error('User not found or invalid password');
      if (setError) {
        setError('Invalid username or password');
      } else {
        alert('Invalid username or password. Please try again.');
      }
    }
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setAuth(prev => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: { ...prev.user, ...updates }
      };
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
    });
    // Reset to default dark on logout
    document.documentElement.classList.add('dark');
  };

  return (
    <>
      {auth.isAuthenticated && auth.user ? (
        <HomePage user={auth.user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      ) : (
        <LoginPage onLogin={handleLogin} users={users} />
      )}
    </>
  );
};

export default App;