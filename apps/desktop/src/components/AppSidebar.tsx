import {
  LayoutDashboard,
  ScrollText,
  Users as UsersIcon,
  UserPlus,
  FolderKanban,
  Zap,
  TriangleAlert,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export type View =
  | 'sales'
  | 'logs'
  | 'users'
  | 'create-user'
  | 'projects'
  | 'actions'
  | 'incidents'
  | 'content';

type NavItem = { id: View; label: string; icon: React.ElementType };

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dashboards',
    items: [
      { id: 'sales', label: 'Sales', icon: LayoutDashboard },
      { id: 'logs', label: 'Logs', icon: ScrollText },
      { id: 'users', label: 'Users', icon: UsersIcon },
    ],
  },
  { label: 'Manage', items: [{ id: 'create-user', label: 'Add user', icon: UserPlus }] },
  {
    label: 'Operations',
    items: [
      { id: 'projects', label: 'Projects', icon: FolderKanban },
      { id: 'actions', label: 'Actions', icon: Zap },
      { id: 'incidents', label: 'Incidents', icon: TriangleAlert },
      { id: 'content', label: 'Content', icon: FileText },
    ],
  },
];

const SOON: { label: string; icon: React.ElementType }[] = [{ label: 'Settings', icon: Settings }];

export function AppSidebar({
  view,
  setView,
  email,
  onSignOut,
}: {
  view: View;
  setView: (v: View) => void;
  email: string | null;
  onSignOut: () => void;
}) {
  const initials = (email ?? 'AA').slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-tight">
            AA
          </span>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold tracking-tight">
              AAF<span className="text-primary">11</span> Nexus
            </div>
            <div className="text-muted-foreground text-[11px]">Employee workspace</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={view === item.id}
                      onClick={() => setView(item.id)}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Coming soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SOON.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton disabled tooltip={item.label} className="opacity-60">
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="group-data-[collapsible=icon]:hidden">Soon</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1">
          <span className="bg-secondary text-secondary-foreground grid size-8 shrink-0 place-items-center rounded-full text-xs font-medium">
            {initials}
          </span>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-medium">{email ?? 'Signed in'}</div>
            <div className="text-muted-foreground text-[11px]">Employee</div>
          </div>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="group-data-[collapsible=icon]:hidden"
          >
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
