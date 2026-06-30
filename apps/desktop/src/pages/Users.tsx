import { UserPlus } from 'lucide-react';
import { SimpleUsersTable } from '@/components/simple-users-table';
import { Button } from '@/components/ui/button';

export function Users({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Team members</h2>
          <p className="text-muted-foreground text-sm">Manage employee access and roles.</p>
        </div>
        <Button onClick={onCreate}>
          <UserPlus />
          Add user
        </Button>
      </div>
      <SimpleUsersTable />
    </div>
  );
}
