import { redirect } from 'next/navigation';

/** The Hub has no UI of its own — send root traffic to the Payload admin. */
export default function HubRoot() {
  redirect('/admin');
}
