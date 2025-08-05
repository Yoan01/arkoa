'use client'

import { differenceInDays } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'

import dayjs from '@/lib/dayjs-config'
import { cn } from '@/lib/utils'

import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface DateMonth {
  month: number
  year: number
}
interface MonthPickerProps {
  initialYear?: number
  date: DateRange
  onMonthSelect: (date: DateRange) => void
  className?: string
  dotSize?: string
  fontSize?: string
  triggerClassName?: string
  placeholder?: string
}

export function MonthPicker({
  initialYear = new Date().getFullYear(),
  date,
  onMonthSelect,
  className,
  dotSize = 'size-[4px]',
  fontSize = 'text-sm',
  triggerClassName,
  placeholder = 'Sélectionner un mois',
}: MonthPickerProps) {
  const [year, setYear] = useState(initialYear)
  const [selectedDate, setSelectedDate] = useState<DateMonth | null>(null)
  const [open, setOpen] = useState(false)

  const months = [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ]

  const getDaysInMonth = (date: Date) => {
    return dayjs(date).daysInMonth()
  }

  const getStartingDay = (date: Date) => {
    return dayjs(date).startOf('month').day()
  }

  const generateDots = (month: number) => {
    const daysInMonth = getDaysInMonth(new Date(year, month))
    const startingDay = getStartingDay(new Date(year, month))

    const dots = []

    if (startingDay === 0) {
      for (let j = 0; j < 6; j++) {
        dots.push(<div key={`empty-first-${j}`} className={cn(dotSize)} />)
      }
    }

    for (let i = 0; i < startingDay - 1; i++) {
      dots.push(<div key={`empty-${i}`} className={cn(dotSize)} />)
    }

    for (let i = 0; i < daysInMonth; i++) {
      dots.push(
        <div
          key={i}
          className={cn(
            dotSize,
            'rounded-full',
            selectedDate?.month === month && selectedDate?.year === year
              ? 'bg-white'
              : 'bg-primary/20'
          )}
        />
      )
    }

    return dots
  }

  const handleMonthSelect = (month: number) => {
    setSelectedDate({ month, year })
    const date: DateRange = {
      from: new Date(year, month, 1),
      to: new Date(year, month, getDaysInMonth(new Date(year, month))),
    }
    onMonthSelect(date)
    setOpen(false)
  }

  useEffect(() => {
    const dayjsBetween =
      date && date.from && date.to && differenceInDays(date.to, date.from) + 1

    if (
      date &&
      date.from &&
      dayjsBetween === getDaysInMonth(date.from) &&
      dayjs(date.from).date() === 1
    ) {
      setYear(date.from.getFullYear())
      setSelectedDate({
        month: date.from.getMonth(),
        year: date.from.getFullYear(),
      })
    }
  }, [date])

  const getDisplayValue = () => {
    if (selectedDate) {
      return `${months[selectedDate.month]} ${selectedDate.year}`
    }
    return placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'justify-between font-normal',
            !selectedDate && 'text-muted-foreground',
            triggerClassName
          )}
        >
          {getDisplayValue()}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-80 p-4', className)} align='start'>
        <div className='mb-6 flex items-center justify-center gap-4 px-1.5'>
          <Button
            variant='outline'
            size='iconXs'
            onClick={() => setYear(year - 1)}
          >
            <ChevronLeft className='h-3 w-3' />
          </Button>
          <span className='font-semibold'>{year}</span>
          <Button
            variant='outline'
            size='iconXs'
            onClick={() => setYear(year + 1)}
          >
            <ChevronRight className='h-3 w-3' />
          </Button>
        </div>

        <div className='grid grid-cols-4 grid-rows-3 gap-3'>
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className={cn(
                'group flex flex-col items-center justify-center py-2 text-left transition-colors focus:outline-none',
                selectedDate?.month === index && selectedDate?.year === year
                  ? 'bg-primary text-primary-foreground rounded-lg'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:ring-primary rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
            >
              <div
                className={cn(fontSize, 'mb-1.5 font-medium transition-colors')}
              >
                {month}
              </div>
              <div className='grid grid-cols-7 grid-rows-6 gap-0.5'>
                {generateDots(index)}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
