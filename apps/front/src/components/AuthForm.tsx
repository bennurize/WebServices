import { useState } from 'react';

import { api, messageOf, type Session } from '../api';
import { textField } from '../form';

interface Props {
  onLogin: (session: Session) => void;
}

export function AuthForm({ onLogin }: Readonly<Props>) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<null | string>(null);

  const submit = async (form: FormData) => {
    const email = textField(form, 'email');
    const password = textField(form, 'password');
    try {
      if (mode === 'register') {
        await api.register(email, textField(form, 'name'), password);
      }
      onLogin(await api.login(email, password));
    } catch (error_) {
      setError(messageOf(error_));
    }
  };

  return (
    <main className="auth">
      <h1>Recettes</h1>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
      >
        <h2>{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
        {mode === 'register' && (
          <input name="name" placeholder="Nom" required />
        )}
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe (8 caractères min.)"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">
          {mode === 'login' ? 'Se connecter' : 'Créer le compte'}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
        >
          {mode === 'login'
            ? 'Pas encore de compte ? Inscription'
            : 'Déjà un compte ? Connexion'}
        </button>
      </form>
    </main>
  );
}
