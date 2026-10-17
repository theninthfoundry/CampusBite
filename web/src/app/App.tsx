import React, { useState } from 'react';
import { AppProviders } from './providers';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { AppRoutes } from './routes';
import { UserProfile } from '../lib/types';

export const App: React.FC = () => {
  const [currentPortal, setCurrentPortal] = useState<'student' | 'kitchen'>('student');
  const [currentLang, setCurrentLang] = useState<string>('en');

  // Stage 1 initial mock user
  const [currentUser] = useState<UserProfile>({
    id: 'usr_stage1_mock',
    name: 'Namira K.',
    role: currentPortal === 'student' ? 'STUDENT' : 'KITCHEN_STAFF',
    department: 'Computer Science',
    balance: 450,
  });

  const togglePortal = () => {
    setCurrentPortal((prev) => (prev === 'student' ? 'kitchen' : 'student'));
  };

  return (
    <ErrorBoundary>
      <AppProviders>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header
            currentPortal={currentPortal}
            onTogglePortal={togglePortal}
            user={{
              ...currentUser,
              role: currentPortal === 'student' ? 'STUDENT' : 'KITCHEN_STAFF',
            }}
            currentLang={currentLang}
            onLanguageChange={setCurrentLang}
          />

          <main id="main-content" style={{ flex: 1, padding: 'var(--space-8) 0' }}>
            <div className="container">
              <AppRoutes currentPortal={currentPortal} onTogglePortal={togglePortal} />
            </div>
          </main>

          <Footer />
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
