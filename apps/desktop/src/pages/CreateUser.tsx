import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CreateUser({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (message: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [team, setTeam] = useState('engineering');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // no backend — just acknowledge and return to the list
    onCreated(`Invite sent to ${email || 'the new member'} (${role})`);
  }

  return (
    <div className="max-w-xl space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onCancel}>
        <ArrowLeft />
        Back to members
      </Button>

      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Add a team member</CardTitle>
            <CardDescription>
              Send an invite — they’ll set a password on first sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Darel Tauro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="darel@aaf11.tech"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Select value={team} onValueChange={setTeam}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={!email}>
              Send invite
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
