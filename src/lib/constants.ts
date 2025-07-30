import {
  CalendarIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'

import { HalfDayPeriod, LeaveStatus, LeaveType } from '@/generated/prisma'

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

export const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.PAID]: 'Congé payé',
  [LeaveType.UNPAID]: 'Congé sans solde',
  [LeaveType.RTT]: 'RTT',
  [LeaveType.SICK]: 'Maladie',
  [LeaveType.MATERNITY]: 'Maternité',
  [LeaveType.PATERNITY]: 'Paternité',
  [LeaveType.PARENTAL]: 'Parental',
  [LeaveType.BEREAVEMENT]: 'Deuil',
  [LeaveType.MARRIAGE]: 'Mariage',
  [LeaveType.MOVING]: 'Déménagement',
  [LeaveType.CHILD_SICK]: 'Enfant malade',
  [LeaveType.TRAINING]: 'Formation',
  [LeaveType.UNJUSTIFIED]: 'Absence injustifiée',
  [LeaveType.ADJUSTMENT]: 'Ajustement',
}

export const leaveStatusLabels: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'En attente',
  [LeaveStatus.APPROVED]: 'Approuvé',
  [LeaveStatus.REJECTED]: 'Rejeté',
  [LeaveStatus.CANCELED]: 'Annulé',
}

export const leaveStatusColors: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'bg-yellow-200 text-yellow-800',
  [LeaveStatus.APPROVED]: 'bg-green-200 text-green-800',
  [LeaveStatus.REJECTED]: 'bg-red-200 text-red-800',
  [LeaveStatus.CANCELED]: 'bg-gray-200 text-gray-600',
}

export const halfDayPeriodLabels: Record<HalfDayPeriod, string> = {
  [HalfDayPeriod.MORNING]: 'Matin',
  [HalfDayPeriod.AFTERNOON]: 'Après-midi',
}
