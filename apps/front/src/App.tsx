import { useState } from 'react';

import type { Session } from './api';

import { AuthForm } from './components/AuthForm';
import { RecipesPage } from './components/RecipesPage';

const SESSION_KEY = 'session';

function loadSession(): null | Session {
  const stored = localStorage.getItem(SESSION_KEY);

  return stored ? (JSON.parse(stored) as Session) : null;
}

export function App() {
  const [session, setSession] = useState(loadSession);

  const login = (next: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  };
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return session ? (
    <RecipesPage session={session} onLogout={logout} />
  ) : (
    <AuthForm onLogin={login} />
  );
}
