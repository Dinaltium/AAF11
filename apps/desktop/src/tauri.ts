/**
 * Thin bridge to native Tauri capabilities. Every function degrades gracefully
 * when NOT running inside Tauri (e.g. `vite preview` in a browser) so the UI
 * can be developed and verified without the Rust shell.
 */

export function inTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Open the embedded Payload admin in its own native webview window. */
export async function openAdminWindow(url: string): Promise<void> {
  if (!inTauri()) {
    window.open(url, '_blank');
    return;
  }
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('open_admin_window', { url });
}

/** Fire a native OS notification (e.g. a project-down alert). */
export async function notify(title: string, body: string): Promise<void> {
  if (!inTauri()) {
    // eslint-disable-next-line no-console
    console.info(`[notify] ${title} — ${body}`);
    return;
  }
  const mod = await import('@tauri-apps/plugin-notification');
  let granted = await mod.isPermissionGranted();
  if (!granted) granted = (await mod.requestPermission()) === 'granted';
  if (granted) mod.sendNotification({ title, body });
}

/** Store the member token in the OS keychain (Rust command). */
export async function saveToken(token: string): Promise<void> {
  if (!inTauri()) {
    localStorage.setItem('aaf11_member_token', token);
    return;
  }
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('save_token', { token });
}

export async function getToken(): Promise<string | null> {
  if (!inTauri()) {
    return localStorage.getItem('aaf11_member_token');
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return (await invoke('get_token')) as string | null;
}
