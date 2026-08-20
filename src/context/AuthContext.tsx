import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export const DEFAULT_DEMO_USERS: User[] = [
  {
    id: 'USR-CITIZEN-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    role: 'CITIZEN',
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    id: 'USR-CITIZEN-2',
    name: 'Pooja Reddy',
    email: 'pooja.reddy@example.com',
    phone: '9123456780',
    role: 'CITIZEN',
    createdAt: '2026-08-11T10:30:00.000Z'
  },
  {
    id: 'USR-OFFICER-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@civic.gov.in',
    phone: '9845012345',
    role: 'OFFICER',
    departmentId: 'DEPT-ELEC',
    departmentName: 'Electrical Department',
    designation: 'Senior Electrical Engineer',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'USR-OFFICER-2',
    name: 'Priya Verma',
    email: 'priya.verma@civic.gov.in',
    phone: '9845098765',
    role: 'OFFICER',
    departmentId: 'DEPT-PWD',
    departmentName: 'Public Works Department',
    designation: 'Assistant Executive Engineer',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'USR-OFFICER-3',
    name: 'Imran Khan',
    email: 'imran.khan@civic.gov.in',
    phone: '9845054321',
    role: 'OFFICER',
    departmentId: 'DEPT-SANI',
    departmentName: 'Sanitation Department',
    designation: 'Zonal Sanitation Inspector',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'USR-ADMIN-1',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@civic.gov.in',
    phone: '9845011111',
    role: 'ADMIN',
    designation: 'Additional Municipal Commissioner',
    createdAt: '2026-08-01T08:00:00.000Z'
  }
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  demoUsers: User[];
  login: (email: string) => Promise<User>;
  register: (name: string, email: string, phone: string, role: UserRole) => Promise<User>;
  logout: () => void;
  switchUser: (targetUser: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('civic_token') : null;
    if (savedToken) {
      const found = DEFAULT_DEMO_USERS.find(u => u.id === savedToken || u.email === savedToken);
      if (found) return found;
    }
    return DEFAULT_DEMO_USERS[0];
  });
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('civic_token') || DEFAULT_DEMO_USERS[0].id : DEFAULT_DEMO_USERS[0].id;
  });
  const [demoUsers, setDemoUsers] = useState<User[]>(DEFAULT_DEMO_USERS);

  // Sync demo users from backend API
  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          setDemoUsers(data.users);
          const savedToken = localStorage.getItem('civic_token');
          if (savedToken) {
            const matched = data.users.find((u: User) => u.id === savedToken || u.email === savedToken);
            if (matched) {
              setUser(matched);
              setToken(matched.id);
            }
          }
        }
      })
      .catch(err => console.error('Failed to load demo users:', err));
  }, []);

  const login = async (email: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('civic_token', data.token);
      return data.user;
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const register = async (name: string, email: string, phone: string, role: UserRole): Promise<User> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, role })
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('civic_token', data.token);
      return data.user;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  };

  const logout = () => {
    const defaultUser = DEFAULT_DEMO_USERS[0];
    setUser(defaultUser);
    setToken(defaultUser.id);
    localStorage.setItem('civic_token', defaultUser.id);
  };

  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    setToken(targetUser.id);
    localStorage.setItem('civic_token', targetUser.id);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        demoUsers,
        login,
        register,
        logout,
        switchUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
