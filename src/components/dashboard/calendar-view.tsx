'use client'

import 'dayjs/locale/fr'

import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekday from 'dayjs/plugin/weekday'
import { CalendarIcon, UserIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

dayjs.extend(isBetween)
dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.locale('fr')

// Données statiques pour le calendrier
const mockLeaves = [
  {
    id: '1',
    employeeName: 'Marie Dupont',
    startDate: '2025-01-15',
    endDate: '2025-01-19',
    type: 'Congés payés',
    status: 'approved',
  },
  {
    id: '2',
    employeeName: 'Jean Martin',
    startDate: '2025-01-22',
    endDate: '2025-01-26',
    type: 'Congés payés',
    status: 'approved',
  },
  {
    id: '3',
    employeeName: 'Sophie Bernard',
    startDate: '2025-01-18',
    endDate: '2025-01-18',
    type: 'Congé maladie',
    status: 'approved',
  },
  {
    id: '4',
    employeeName: 'Pierre Durand',
    startDate: '2025-01-29',
    endDate: '2025-02-02',
    type: 'Congés payés',
    status: 'pending',
  },
  {
    id: '5',
    employeeName: 'Claire Moreau',
    startDate: '2025-01-25',
    endDate: '2025-01-25',
    type: 'Demi-journée',
    status: 'approved',
  },
  // Données supplémentaires pour tester l'affichage multiple
  {
    id: '6',
    employeeName: 'Thomas Leroy',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    type: 'Congés payés',
    status: 'approved',
  },
  {
    id: '7',
    employeeName: 'Emma Rousseau',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    type: 'Congé maladie',
    status: 'approved',
  },
  {
    id: '8',
    employeeName: 'Lucas Petit',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    type: 'Congés payés',
    status: 'approved',
  },
  {
    id: '9',
    employeeName: 'Camille Blanc',
    startDate: '2025-01-15',
    endDate: '2025-01-15',
    type: 'Demi-journée',
    status: 'approved',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Congés payés':
      return 'bg-blue-100 text-blue-800'
    case 'Congé maladie':
      return 'bg-red-100 text-red-800'
    case 'Demi-journée':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('D MMM')
}

export const CalendarView: React.FC = () => {
  const [viewMode, setViewMode] = useState('month')
  const [currentDate, setCurrentDate] = useState(dayjs())

  // Obtenir les informations du mois actuel
  const startOfMonth = currentDate.startOf('month')
  const endOfMonth = currentDate.endOf('month')
  const daysInMonth = endOfMonth.date()
  const startingDayOfWeek = startOfMonth.isoWeekday() - 1 // Lundi = 0

  // Générer les dates du mois précédent pour remplir la grille
  const prevMonthDays = []
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(startOfMonth.subtract(i + 1, 'day').date())
  }

  // Générer les dates du mois suivant pour remplir la grille
  const nextMonthDays = []
  const totalCells = 42 // 6 semaines × 7 jours
  const remainingCells = totalCells - prevMonthDays.length - daysInMonth
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(i)
  }

  // Filtrer les congés par mois sélectionné
  const filteredLeaves = mockLeaves.filter(leave => {
    const leaveStart = dayjs(leave.startDate)
    return leaveStart.isSame(currentDate, 'month')
  })

  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5 text-blue-500' />
            <CardTitle>Calendrier des congés</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Select
              value={currentDate.format('YYYY-MM')}
              onValueChange={value => {
                setCurrentDate(dayjs(value + '-01'))
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue>{currentDate.format('MMMM YYYY')}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = dayjs().add(i - 6, 'month')
                  return (
                    <SelectItem key={i} value={date.format('YYYY-MM')}>
                      {date.format('MMMM YYYY')}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='month'>Mois</SelectItem>
                <SelectItem value='list'>Liste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'list' ? (
          <div className='space-y-3'>
            {filteredLeaves.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center'>
                Aucun congé prévu pour cette période
              </p>
            ) : (
              filteredLeaves.map(leave => (
                <div
                  key={leave.id}
                  className='flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50'
                >
                  <div className='flex items-center gap-3'>
                    <UserIcon className='h-4 w-4 text-gray-500' />
                    <div>
                      <p className='font-medium'>{leave.employeeName}</p>
                      <p className='text-muted-foreground text-sm'>
                        {leave.startDate === leave.endDate
                          ? formatDate(leave.startDate)
                          : `${formatDate(leave.startDate)} - ${formatDate(
                              leave.endDate
                            )}`}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className={getTypeColor(leave.type)}
                    >
                      {leave.type}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={getStatusColor(leave.status)}
                    >
                      {leave.status === 'approved'
                        ? 'Approuvé'
                        : leave.status === 'pending'
                          ? 'En attente'
                          : 'Rejeté'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className='grid grid-cols-7 gap-2'>
            {/* En-têtes des jours */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div
                key={day}
                className='text-muted-foreground p-2 text-center text-sm font-medium'
              >
                {day}
              </div>
            ))}

            {/* Jours du mois précédent */}
            {prevMonthDays.map((day, index) => (
              <div
                key={`prev-${index}`}
                className='min-h-16 rounded border bg-gray-50 p-1 text-gray-400'
              >
                <div className='text-sm font-medium'>{day}</div>
              </div>
            ))}

            {/* Jours du mois actuel */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const currentDay = currentDate.date(day)
              const dateString = currentDay.format('YYYY-MM-DD')
              const dayLeaves = mockLeaves.filter(leave =>
                dayjs(dateString).isBetween(
                  dayjs(leave.startDate),
                  dayjs(leave.endDate),
                  'day',
                  '[]'
                )
              )

              const isToday = currentDay.isSame(dayjs(), 'day')
              const maxVisibleLeaves = 2
              const visibleLeaves = dayLeaves.slice(0, maxVisibleLeaves)
              const remainingCount = dayLeaves.length - maxVisibleLeaves

              return (
                <div
                  key={day}
                  className={`min-h-20 rounded border p-1 transition-colors hover:bg-gray-50 ${
                    isToday ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                  title={
                    dayLeaves.length > 0
                      ? `${dayLeaves.length} congé(s) ce jour`
                      : ''
                  }
                >
                  <div
                    className={`mb-1 text-sm font-medium ${
                      isToday ? 'text-blue-600' : ''
                    }`}
                  >
                    {day}
                  </div>
                  <div className='space-y-0.5'>
                    {visibleLeaves.map(leave => (
                      <div
                        key={leave.id}
                        className={`truncate rounded px-1 py-0.5 text-xs ${
                          leave.type === 'Congés payés'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        title={`${leave.employeeName} - ${leave.type}`}
                      >
                        {leave.employeeName.split(' ')[0]}
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='cursor-default px-1 text-xs font-medium text-gray-500'>
                            +{remainingCount} autre
                            {remainingCount > 1 ? 's' : ''}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className='text-xs'>
                            <div className='mb-1 font-medium'>
                              Autres personnes en congé:
                            </div>
                            {dayLeaves
                              .slice(maxVisibleLeaves)
                              .map((leave, index) => (
                                <div key={index}>{leave.employeeName}</div>
                              ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Jours du mois suivant */}
            {nextMonthDays.map((day, index) => (
              <div
                key={`next-${index}`}
                className='min-h-16 rounded border bg-gray-50 p-1 text-gray-400'
              >
                <div className='text-sm font-medium'>{day}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
