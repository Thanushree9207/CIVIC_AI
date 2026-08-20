import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminManagementPage } from './pages/AdminManagementPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { Complaint, User } from './types';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const handleSelectComplaint = (complaint: Complaint) => {
    setSelectedComplaintId(complaint.id);
    setCurrentTab('complaint-detail');
  };

  const handleNavigateToComplaintId = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentTab('complaint-detail');
  };

  const handleSelectTab = (tab: string) => {
    if (tab !== 'complaint-detail') {
      setSelectedComplaintId(null);
    }
    setCurrentTab(tab);
  };

  const handleComplaintSubmitted = (complaint: Complaint) => {
    setSelectedComplaintId(complaint.id);
    setCurrentTab('complaint-detail');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      <main className="flex-1">
        {currentTab === 'landing' && <LandingPage onSelectTab={handleSelectTab} />}

        {currentTab === 'login' && (
          <LoginPage
            onNavigate={handleSelectTab}
            onSuccess={(loggedInUser: User) => {
              if (loggedInUser?.role === 'ADMIN') setCurrentTab('admin-dashboard');
              else if (loggedInUser?.role === 'OFFICER') setCurrentTab('officer-dashboard');
              else setCurrentTab('citizen-dashboard');
            }}
          />
        )}

        {currentTab === 'register' && (
          <RegisterPage
            onNavigate={handleSelectTab}
            onSuccess={(registeredUser: User) => {
              if (registeredUser?.role === 'ADMIN') setCurrentTab('admin-dashboard');
              else if (registeredUser?.role === 'OFFICER') setCurrentTab('officer-dashboard');
              else setCurrentTab('citizen-dashboard');
            }}
          />
        )}

        {currentTab === 'citizen-dashboard' && (
          <CitizenDashboard
            onSelectComplaint={handleSelectComplaint}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === 'my-complaints' && (
          <CitizenDashboard
            onSelectComplaint={handleSelectComplaint}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === 'submit-complaint' && (
          <SubmitComplaintPage onSuccess={handleComplaintSubmitted} />
        )}

        {(currentTab === 'officer-dashboard' || currentTab === 'officer-complaints') && (
          <OfficerDashboard onSelectComplaint={handleSelectComplaint} />
        )}

        {(currentTab === 'admin-dashboard' || currentTab === 'admin-complaints') && (
          <AdminDashboard
            onSelectComplaint={handleSelectComplaint}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === 'admin-management' && <AdminManagementPage />}

        {currentTab === 'notifications' && (
          <NotificationsPage onSelectComplaintId={handleNavigateToComplaintId} />
        )}

        {currentTab === 'complaint-detail' && selectedComplaintId && (
          <ComplaintDetailPage
            complaintId={selectedComplaintId}
            onBack={() => {
              if (user?.role === 'ADMIN') setCurrentTab('admin-dashboard');
              else if (user?.role === 'OFFICER') setCurrentTab('officer-dashboard');
              else setCurrentTab('citizen-dashboard');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
