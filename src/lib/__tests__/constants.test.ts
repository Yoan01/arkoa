import { HalfDayPeriod, LeaveStatus, LeaveType } from '@/generated/prisma'

import {
  appSidebarManager,
  appSidebarNav,
  halfDayPeriodLabels,
  leaveStatusColors,
  leaveStatusLabels,
  leaveTypeLabels,
  routeTitles,
} from '../constants'

describe('constants', () => {
  describe('appSidebarNav', () => {
    it('should contain correct navigation items', () => {
      expect(appSidebarNav).toHaveLength(2)
      expect(appSidebarNav[0]).toMatchObject({
        title: 'Tableau de bord',
        url: '/',
      })
      expect(appSidebarNav[0].icon).toBeDefined()
      expect(appSidebarNav[1]).toMatchObject({
        title: 'Mes congés',
        url: '/leaves',
      })
      expect(appSidebarNav[1].icon).toBeDefined()
    })
  })

  describe('appSidebarManager', () => {
    it('should contain correct manager navigation items', () => {
      expect(appSidebarManager).toHaveLength(3)
      expect(appSidebarManager[0]).toMatchObject({
        title: 'Mon équipe',
        url: '/team',
      })
      expect(appSidebarManager[0].icon).toBeDefined()
      expect(appSidebarManager[1]).toMatchObject({
        title: 'Demandes à valider',
        url: '/approvals',
      })
      expect(appSidebarManager[1].icon).toBeDefined()
      expect(appSidebarManager[2]).toMatchObject({
        title: 'Gestion RH',
        url: '/hr',
      })
      expect(appSidebarManager[2].icon).toBeDefined()
    })
  })

  describe('routeTitles', () => {
    it('should map routes to correct titles', () => {
      expect(routeTitles['/']).toBe('Tableau de bord')
      expect(routeTitles['/leaves']).toBe('Mes congés')
      expect(routeTitles['/team']).toBe('Mon équipe')
      expect(routeTitles['/approvals']).toBe('Demandes à valider')
      expect(routeTitles['/hr']).toBe('Gestion RH')
    })

    it('should have entries for all main routes', () => {
      const expectedRoutes = ['/', '/leaves', '/team', '/approvals', '/hr']
      expectedRoutes.forEach(route => {
        expect(routeTitles[route]).toBeDefined()
        expect(typeof routeTitles[route]).toBe('string')
      })
    })
  })

  describe('leaveTypeLabels', () => {
    it('should have labels for all leave types', () => {
      const leaveTypes = Object.values(LeaveType)
      leaveTypes.forEach(type => {
        expect(leaveTypeLabels[type]).toBeDefined()
        expect(typeof leaveTypeLabels[type]).toBe('string')
      })
    })

    it('should have correct French labels', () => {
      expect(leaveTypeLabels[LeaveType.PAID]).toBe('Congé payé')
      expect(leaveTypeLabels[LeaveType.SICK]).toBe('Maladie')
      expect(leaveTypeLabels[LeaveType.RTT]).toBe('RTT')
      expect(leaveTypeLabels[LeaveType.MATERNITY]).toBe('Maternité')
    })
  })

  describe('leaveStatusLabels', () => {
    it('should have labels for all leave statuses', () => {
      const statuses = Object.values(LeaveStatus)
      statuses.forEach(status => {
        expect(leaveStatusLabels[status]).toBeDefined()
        expect(typeof leaveStatusLabels[status]).toBe('string')
      })
    })

    it('should have correct French labels', () => {
      expect(leaveStatusLabels[LeaveStatus.PENDING]).toBe('En attente')
      expect(leaveStatusLabels[LeaveStatus.APPROVED]).toBe('Approuvé')
      expect(leaveStatusLabels[LeaveStatus.REJECTED]).toBe('Rejeté')
      expect(leaveStatusLabels[LeaveStatus.CANCELED]).toBe('Annulé')
    })
  })

  describe('leaveStatusColors', () => {
    it('should have colors for all leave statuses', () => {
      const statuses = Object.values(LeaveStatus)
      statuses.forEach(status => {
        expect(leaveStatusColors[status]).toBeDefined()
        expect(typeof leaveStatusColors[status]).toBe('string')
        expect(leaveStatusColors[status]).toMatch(/^bg-\w+-\d+ text-\w+-\d+$/)
      })
    })

    it('should have appropriate color schemes', () => {
      expect(leaveStatusColors[LeaveStatus.PENDING]).toContain('yellow')
      expect(leaveStatusColors[LeaveStatus.APPROVED]).toContain('green')
      expect(leaveStatusColors[LeaveStatus.REJECTED]).toContain('red')
      expect(leaveStatusColors[LeaveStatus.CANCELED]).toContain('gray')
    })
  })

  describe('halfDayPeriodLabels', () => {
    it('should have labels for all half day periods', () => {
      const periods = Object.values(HalfDayPeriod)
      periods.forEach(period => {
        expect(halfDayPeriodLabels[period]).toBeDefined()
        expect(typeof halfDayPeriodLabels[period]).toBe('string')
      })
    })

    it('should have correct French labels', () => {
      expect(halfDayPeriodLabels[HalfDayPeriod.MORNING]).toBe('Matin')
      expect(halfDayPeriodLabels[HalfDayPeriod.AFTERNOON]).toBe('Après-midi')
    })
  })
})
