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
    url: '/',
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

export const routeTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/leaves': 'Mes congés',
  '/team': 'Mon équipe',
  '/approvals': 'Demandes à valider',
  '/hr': 'Gestion RH',
}

export const leaveTypesLabels = [
  { value: 'PAID', label: 'Congés payés (CP)' },
  { value: 'UNPAID', label: 'Congé sans solde' },
  { value: 'RTT', label: 'Réduction du temps de travail' },
  { value: 'SICK', label: 'Maladie' },
  { value: 'MATERNITY', label: 'Maternité' },
  { value: 'PATERNITY', label: 'Paternité' },
  { value: 'PARENTAL', label: 'Parental' },
  { value: 'BEREAVEMENT', label: 'Deuil' },
  { value: 'MARRIAGE', label: 'Mariage' },
  { value: 'MOVING', label: 'Déménagement' },
  { value: 'CHILD_SICK', label: 'Enfant malade' },
  { value: 'TRAINING', label: 'Formation' },
  { value: 'UNJUSTIFIED', label: 'Absence injustifiée' },
  { value: 'ADJUSTMENT', label: 'Ajustement manuel' },
]
