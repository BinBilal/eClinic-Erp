/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { LoginView } from './experiences/auth/LoginView';
import { PharmaceuticalDashboard } from './experiences/pharmaceutical/PharmaceuticalDashboard';
import { PharmacyDashboard } from './experiences/pharmacy/PharmacyDashboard';
import { PublicWebsite } from './experiences/public/PublicWebsite';
import { SuperAdminDashboard } from './experiences/super-admin/SuperAdminDashboard';
import { DemoProvider } from './store/demoStore';
import { ThemeProvider } from './store/themeStore';
import { ExperienceRole } from './types/erp';

const HASH_TO_ROLE: Record<string, ExperienceRole> = {
  '#public': 'public',
  '#login': 'login',
  '#super-admin': 'super_admin',
  '#pharmacy': 'pharmacy_admin',
  '#pharmaceutical': 'pharmaceutical_admin',
};

const ROLE_TO_HASH: Record<ExperienceRole, string> = {
  public: '#public',
  login: '#login',
  super_admin: '#super-admin',
  pharmacy_admin: '#pharmacy',
  pharmaceutical_admin: '#pharmaceutical',
};

function getInitialRole(): ExperienceRole {
  const hash = window.location.hash;
  return HASH_TO_ROLE[hash] || 'public';
}

export default function App() {
  const [role, setRole] = useState<ExperienceRole>(getInitialRole);

  useEffect(() => {
    const onHashChange = () => {
      const next = HASH_TO_ROLE[window.location.hash];
      if (next) setRole(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const switchRole = (nextRole: ExperienceRole) => {
    setRole(nextRole);
    window.location.hash = ROLE_TO_HASH[nextRole];
    window.scrollTo({ top: 0 });
  };

  return (
    <ThemeProvider>
      <DemoProvider>
        {role === 'public' && <PublicWebsite onNavigateRole={switchRole} />}
        {role === 'login' && <LoginView onAuthenticate={switchRole} />}
        {role === 'super_admin' && <SuperAdminDashboard onSwitchExperience={switchRole} />}
        {role === 'pharmacy_admin' && <PharmacyDashboard onSwitchExperience={switchRole} />}
        {role === 'pharmaceutical_admin' && (
          <PharmaceuticalDashboard onSwitchExperience={switchRole} />
        )}
      </DemoProvider>
    </ThemeProvider>
  );
}
