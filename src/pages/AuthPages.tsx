import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { Sparkles, ArrowRight, Shield, Lock, Mail, Phone, CheckCircle2, Building2, UserCheck } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onNavigate?: (tab: string) => void;
}

export const LoginPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigate }) => {
  const { login, demoUsers, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(email);
      onSuccess(loggedIn);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (u: User) => {
    switchUser(u);
    onSuccess(u);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#020617]">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-950/50">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Sign In to Civic AI</h2>
          <p className="text-xs text-slate-400 mt-1">Select a role below to launch Citizen, Officer, or Admin dashboard</p>
        </div>

        {/* 1-Click Quick Demo Switch (All Roles) */}
        <div className="bg-[#1e293b]/70 p-3.5 rounded-xl border border-slate-700/60 mb-6">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block mb-2.5 text-center">
            1-Click Demo Login (Select Persona):
          </span>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {demoUsers.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectDemoUser(u)}
                className="w-full text-left p-2.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:border-emerald-500/50 flex items-center justify-between text-xs transition-all cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-white block group-hover:text-emerald-400 transition-colors">
                    {u.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {u.role === 'ADMIN' ? 'Municipal Commissioner' : u.role === 'OFFICER' ? `${u.departmentName || 'Field Officer'}` : 'Resident Citizen'} &bull; {u.email}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-900/80 text-purple-300 border border-purple-700/60'
                      : u.role === 'OFFICER'
                      ? 'bg-amber-900/80 text-amber-300 border border-amber-700/60'
                      : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60'
                  }`}
                >
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Or Sign In with Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rajesh.kumar@civic.gov.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In with Email'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {onNavigate && (
            <div className="text-center pt-2">
              <span className="text-slate-400">New citizen or officer? </span>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Create an Account
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUser = await register(name, email, phone, role);
      onSuccess(newUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#020617]">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-950/50">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Create Civic Account</h2>
          <p className="text-xs text-slate-400 mt-1">Register to submit grievances and track real-time SLA accountability</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ramesh@example.com"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Phone Number (10 Digits)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Account Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['CITIZEN', 'OFFICER', 'ADMIN'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    role === r
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {onNavigate && (
            <div className="text-center pt-2">
              <span className="text-slate-400">Already registered? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
