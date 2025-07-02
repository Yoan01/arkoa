import {
  CalendarIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'

export const appSidebarNav = [
  {
    title: 'Tableau de bord',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
    roles: ['EMPLOYEE', 'MANAGER'],
  },
  {
    title: 'Mes congés',
    url: '/leaves',
    icon: CalendarIcon,
    roles: ['EMPLOYEE', 'MANAGER'],
  },
]

export const appSidebarManager = [
  {
    name: 'Équipe',
    url: '/team',
    icon: UsersIcon,
  },
  {
    name: 'Demandes à valider',
    url: '/approvals',
    icon: ClipboardListIcon,
  },
  {
    name: 'Gestion RH',
    url: '/hr',
    icon: ShieldCheckIcon,
  },
]
