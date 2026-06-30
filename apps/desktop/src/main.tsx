import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css';
import { App } from './App';
import { AuthProvider, useAuth } from './auth';
import { Login } from './components/Login';

function Root() {
  const { loading, authed } = useAuth();
  if (loading) {
    return (
      <div className="bg-background text-muted-foreground grid min-h-screen place-items-center text-sm">
        Loading…
      </div>
    );
  }
  return authed ? <App /> : <Login />;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
);
