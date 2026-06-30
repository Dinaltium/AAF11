import { useState } from 'react';
import { FaGithub, FaMicrosoft, FaSlack } from 'react-icons/fa';
import { Auth1 } from '@/components/watermelon-ui/auth-01';
import { useAuth } from '@/auth';

export function Login() {
  const { signIn, configured, devEnter } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(email: string, password: string) {
    setBusy(true);
    setError(null);
    const res = await signIn(email.trim(), password);
    if (res.error) setError(res.error);
    setBusy(false);
  }

  const soon = (name: string) => () =>
    setError(`${name} sign-in isn’t enabled yet — use your email.`);

  return (
    <Auth1
      heading="Sign in to AAF11 Nexus"
      subheading="Employee workspace — your projects, logs, and stats."
      submitLabel={busy ? 'Signing in…' : 'Sign in'}
      onSubmit={handleSubmit}
      errorText={error ?? undefined}
      busy={busy}
      forgotPasswordText="Forgot password?"
      onForgotPassword={() => setError('Password reset isn’t wired up yet — ask an admin.')}
      dividerText="or continue with"
      socialProviders={[
        { name: 'GitHub', icon: <FaGithub className="h-4 w-4" />, onClick: soon('GitHub') },
        { name: 'Microsoft', icon: <FaMicrosoft className="h-4 w-4" />, onClick: soon('Microsoft') },
        { name: 'Slack', icon: <FaSlack className="h-4 w-4" />, onClick: soon('Slack') },
      ]}
      bottomPromptText={configured ? 'Need access?' : 'Supabase not configured.'}
      bottomPromptLinkText={configured ? 'Ask an admin' : 'Continue without auth (dev)'}
      onBottomPromptClick={configured ? undefined : devEnter}
    />
  );
}
