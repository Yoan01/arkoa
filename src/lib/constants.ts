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
  },
  {
    title: 'Mes congés',
    url: '/leaves',
    icon: CalendarIcon,
  },
]

export const appSidebarManager = [
  {
    title: 'Mon équipe',
    url: '/team',
    icon: UsersIcon,
  },
  {
    title: 'Demandes à valider',
    url: '/approvals',
    icon: ClipboardListIcon,
  },
  {
    title: 'Gestion RH',
    url: '/hr',
    icon: ShieldCheckIcon,
  },
]
