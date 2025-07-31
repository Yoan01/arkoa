'use client'

import 'dayjs/locale/fr'

import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekday from 'dayjs/plugin/weekday'
import { CalendarIcon, UserIcon } from 'lucide-react'
import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonthPicker } from '@/components/ui/month-picker'
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
import { LeaveType } from '@/generated/prisma'
import { useGetCalendarLeaves } from '@/hooks/api/leaves/get-calendar-leaves'
import { leaveTypeLabels } from '@/lib/constants'
import { CalendarLeave } from '@/schemas/queries/calendar-leaves-schema'
import { useCompanyStore } from '@/stores/use-company-store'

dayjs.extend(isBetween)
dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.locale('fr')

// Fonction pour transformer les données de l'API en format utilisable
const transformLeaveData = (leave: CalendarLeave) => ({
  id: leave.id,
  employeeName: leave.membership.user.name,
  startDate: dayjs(leave.startDate).format('YYYY-MM-DD'),
  endDate: dayjs(leave.endDate).format('YYYY-MM-DD'),
  type: leave.type,
  status: leave.status.toLowerCase(),
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Congés payés':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Congé maladie':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'Demi-journée':
      return 'bg-violet-50 text-violet-700 border-violet-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('D MMM')
}

export const CalendarView: React.FC = () => {
  const [viewMode, setViewMode] = useState('month')
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  })
  const { activeCompany } = useCompanyStore()

  // Fonction pour gérer la sélection du mois
  const handleMonthSelect = (dateRange: DateRange) => {
    if (dateRange.from) {
      setCurrentDate(dayjs(dateRange.from))
      setSelectedDateRange(dateRange)
    }
  }

  // Récupération des données via l'API
  const {
    data: calendarLeaves = [],
    isLoading,
    error,
  } = useGetCalendarLeaves({
    companyId: activeCompany?.id || '',
    year: currentDate.year(),
    month: currentDate.month() + 1, // dayjs utilise 0-11, l'API attend 1-12
  })

  // Transformation des données pour compatibilité avec le code existant
  const mockLeaves = calendarLeaves.map(transformLeaveData)

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
  const totalCells = 35 // 5 semaines × 7 jours
  const remainingCells = totalCells - prevMonthDays.length - daysInMonth
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(i)
  }

  // Les données sont déjà filtrées par l'API selon le mois sélectionné
  const filteredLeaves = mockLeaves

  // Gestion des états de chargement et d'erreur
  if (!activeCompany) {
    return (
      <Card className='shadow-sm'>
        <CardContent className='py-8'>
          <p className='text-muted-foreground text-center'>
            Veuillez sélectionner une entreprise
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='shadow-sm'>
        <CardContent className='py-8'>
          <p className='text-center text-red-500'>
            Erreur lors du chargement des congés
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='flex h-full flex-col border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg'>
      <CardHeader className='border-b border-slate-100 bg-white/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-500/10 p-2'>
              <CalendarIcon className='h-5 w-5 text-blue-600' />
            </div>
            <CardTitle className='text-xl font-semibold text-slate-800'>
              Calendrier des congés
            </CardTitle>
          </div>
          <div className='flex items-center gap-3'>
            <MonthPicker
              initialYear={currentDate.year()}
              date={selectedDateRange}
              onMonthSelect={handleMonthSelect}
              triggerClassName='w-44 border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white font-medium'
              placeholder='Sélectionner un mois'
            />
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className='w-36 border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white'>
                <SelectValue className='font-medium' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='month'>Mois</SelectItem>
                <SelectItem value='list'>Liste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex-1'>
        {isLoading ? (
          <div className='py-8 text-center'>
            <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
            <p className='font-medium text-slate-600'>
              Chargement des congés...
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className='space-y-3'>
            {filteredLeaves.length === 0 ? (
              <div className='py-8 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
                  <CalendarIcon className='h-8 w-8 text-slate-400' />
                </div>
                <p className='mb-1 font-medium text-slate-600'>
                  Aucun congé prévu
                </p>
                <p className='text-sm text-slate-500'>pour cette période</p>
              </div>
            ) : (
              filteredLeaves.map(leave => (
                <div
                  key={leave.id}
                  className='group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-md'
                >
                  <div className='flex items-center gap-4'>
                    <div className='rounded-full bg-slate-100 p-2 transition-colors group-hover:bg-slate-200'>
                      <UserIcon className='h-4 w-4 text-slate-600' />
                    </div>
                    <div>
                      <p className='font-semibold text-slate-800'>
                        {leave.employeeName}
                      </p>
                      <p className='text-sm font-medium text-slate-600'>
                        {leave.startDate === leave.endDate
                          ? formatDate(leave.startDate)
                          : `${formatDate(leave.startDate)} - ${formatDate(
                              leave.endDate
                            )}`}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge
                      variant='outline'
                      className={`${getTypeColor(leave.type)} px-3 py-1 font-medium`}
                    >
                      {leave.type}
                    </Badge>
                    <Badge
                      variant='outline'
                      className={`${getStatusColor(leave.status)} px-3 py-1 font-medium`}
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
          <div className='grid h-full grid-cols-7 gap-2'>
            {/* En-têtes des jours */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div
                key={day}
                className='rounded-lg bg-slate-50 p-2 text-center text-sm font-semibold text-slate-600'
              >
                {day}
              </div>
            ))}

            {/* Jours du mois précédent */}
            {prevMonthDays.map((day, index) => (
              <div
                key={`prev-${index}`}
                className='min-h-16 rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-slate-400'
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
                  className={`min-h-16 cursor-pointer rounded-xl border p-2 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs ${
                    isToday
                      ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md'
                      : 'border-slate-200 bg-white'
                  }`}
                  title={
                    dayLeaves.length > 0
                      ? `${dayLeaves.length} congé(s) ce jour`
                      : ''
                  }
                >
                  <div
                    className={`mb-2 text-sm font-semibold ${
                      isToday ? 'text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </div>
                  <div className='space-y-1'>
                    {visibleLeaves.map(leave => (
                      <div
                        key={leave.id}
                        className={`truncate rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                          leave.type === LeaveType.PAID
                            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : leave.type === LeaveType.SICK
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                        }`}
                        title={`${leave.employeeName} - ${leaveTypeLabels[leave.type]}`}
                      >
                        {leave.employeeName}
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='cursor-help rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200'>
                            +{remainingCount} autre
                            {remainingCount > 1 ? 's' : ''}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className='border border-slate-200 bg-white shadow-lg'>
                          <div className='max-w-xs text-sm'>
                            <div className='mb-2 font-semibold text-slate-800'>
                              Autres personnes en congé:
                            </div>
                            <div className='space-y-1'>
                              {dayLeaves
                                .slice(maxVisibleLeaves)
                                .map((leave, index) => (
                                  <div
                                    key={index}
                                    className='font-medium text-slate-700'
                                  >
                                    {leave.employeeName}
                                  </div>
                                ))}
                            </div>
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
                className='min-h-16 rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-slate-400'
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
