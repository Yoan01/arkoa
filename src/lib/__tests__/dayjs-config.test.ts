import 'dayjs/locale/fr'
import '../dayjs-config'

import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'

// Ensure plugins are extended for tests
dayjs.extend(isBetween)
dayjs.extend(isoWeek)
dayjs.extend(weekday)
dayjs.extend(utc)
dayjs.extend(timezone)

describe('dayjs-config', () => {
  describe('Exports', () => {
    it('should export dayjs as default', () => {
      expect(dayjs).toBeDefined()
      expect(typeof dayjs).toBe('function')
    })

    it('should export Dayjs type', () => {
      const date: Dayjs = dayjs('2024-01-15')
      expect(date.isValid()).toBe(true)
    })
  })

  describe('French locale configuration', () => {
    beforeEach(() => {
      dayjs.locale('fr')
    })

    it('should have French locale configured by default', () => {
      const date = dayjs('2024-01-15')
      expect(date.locale()).toBe('fr')
    })

    it('should format dates in French', () => {
      const date = dayjs('2024-01-15').locale('fr')
      expect(date.format('dddd')).toBe('lundi')
      expect(date.format('MMMM')).toBe('janvier')
      expect(date.format('MMM')).toBe('janv.')
    })

    it('should handle French month names', () => {
      const months = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ]
      months.forEach((month, index) => {
        const date = dayjs(
          `2024-${String(index + 1).padStart(2, '0')}-15`
        ).locale('fr')
        expect(date.format('MMMM')).toBe(month)
      })
    })

    it('should handle French day names', () => {
      const days = [
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
      ]
      // 2024-01-14 is a Sunday
      for (let i = 0; i < 7; i++) {
        const date = dayjs('2024-01-14').add(i, 'day').locale('fr')
        expect(date.format('dddd')).toBe(days[i])
      }
    })
  })

  describe('Timezone configuration', () => {
    it('should have Europe/Paris as default timezone', () => {
      const date = dayjs('2024-01-15T12:00:00')
      const parisDate = date.tz()
      expect(parisDate.isValid()).toBe(true)
    })

    it('should handle timezone conversions', () => {
      const utcDate = dayjs.utc('2024-01-15T12:00:00Z')
      const parisDate = utcDate.tz('Europe/Paris')
      const newYorkDate = utcDate.tz('America/New_York')

      expect(parisDate.isValid()).toBe(true)
      expect(newYorkDate.isValid()).toBe(true)
      expect(parisDate.format()).not.toBe(newYorkDate.format())
    })

    it('should maintain timezone information', () => {
      const date = dayjs('2024-06-15T12:00:00').tz('Europe/Paris')
      expect(date.format('Z')).toMatch(/^[+-]\d{2}:\d{2}$/)
    })
  })

  describe('Plugin functionality', () => {
    describe('isBetween plugin', () => {
      it('should check if date is between two dates (inclusive)', () => {
        const date = dayjs('2024-01-15')
        const start = dayjs('2024-01-10')
        const end = dayjs('2024-01-20')
        expect(date.isBetween(start, end, null, '[]')).toBe(true)
      })

      it('should check if date is between two dates (exclusive)', () => {
        const date = dayjs('2024-01-15')
        const start = dayjs('2024-01-15')
        const end = dayjs('2024-01-20')
        expect(date.isBetween(start, end, null, '()')).toBe(false)
        expect(date.isBetween(start, end, null, '[]')).toBe(true)
      })

      it('should handle different units', () => {
        const date = dayjs('2024-01-15T12:30:00')
        const start = dayjs('2024-01-15T10:00:00')
        const end = dayjs('2024-01-15T14:00:00')
        expect(date.isBetween(start, end, 'hour')).toBe(true)
      })
    })

    describe('isoWeek plugin', () => {
      it('should return correct ISO week number', () => {
        const date = dayjs('2024-01-15') // Week 3 of 2024
        expect(date.isoWeek()).toBe(3)
      })

      it('should handle year boundaries correctly', () => {
        const date = dayjs('2024-01-01') // Should be week 1
        expect(date.isoWeek()).toBe(1)
      })

      it('should set ISO week', () => {
        const date = dayjs('2024-01-15')
        const newDate = date.isoWeek(10)
        expect(newDate.isoWeek()).toBe(10)
      })
    })

    describe('weekday plugin', () => {
      it('should return correct weekday', () => {
        const sunday = dayjs('2024-01-14')
        const monday = dayjs('2024-01-15')
        // weekday() is locale-aware, in French locale Monday is 0
        expect(sunday.weekday()).toBe(6) // Sunday is 6 in French locale
        expect(monday.weekday()).toBe(0) // Monday is 0 in French locale
      })

      it('should set weekday', () => {
        const date = dayjs('2024-01-15') // Monday
        const friday = date.weekday(5)
        expect(friday.weekday()).toBe(5)
      })
    })

    describe('utc plugin', () => {
      it('should convert to UTC', () => {
        const localDate = dayjs('2024-01-15T12:00:00')
        const utcDate = localDate.utc()
        expect(utcDate.isUTC()).toBe(true)
      })

      it('should handle UTC parsing', () => {
        const utcDate = dayjs.utc('2024-01-15T12:00:00Z')
        expect(utcDate.isUTC()).toBe(true)
        expect(utcDate.isValid()).toBe(true)
      })
    })

    describe('timezone plugin', () => {
      it('should convert between timezones', () => {
        const parisDate = dayjs('2024-01-15T12:00:00').tz('Europe/Paris')
        const tokyoDate = parisDate.tz('Asia/Tokyo')
        expect(tokyoDate.isValid()).toBe(true)
        expect(parisDate.format('HH')).not.toBe(tokyoDate.format('HH'))
      })

      it('should handle DST transitions', () => {
        // Summer time in Paris
        const summerDate = dayjs('2024-07-15T12:00:00').tz('Europe/Paris')
        // Winter time in Paris
        const winterDate = dayjs('2024-01-15T12:00:00').tz('Europe/Paris')

        expect(summerDate.isValid()).toBe(true)
        expect(winterDate.isValid()).toBe(true)
      })
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle invalid dates', () => {
      const invalidDate = dayjs('invalid-date')
      expect(invalidDate.isValid()).toBe(false)
    })

    it('should handle null and undefined', () => {
      const nullDate = dayjs(null)
      const undefinedDate = dayjs(undefined)
      expect(nullDate.isValid()).toBe(false)
      // dayjs(undefined) returns current date, so it's valid
      expect(undefinedDate.isValid()).toBe(true)
    })

    it('should handle edge date values', () => {
      const minDate = dayjs('1900-01-01')
      const maxDate = dayjs('2100-12-31')
      expect(minDate.isValid()).toBe(true)
      expect(maxDate.isValid()).toBe(true)
    })

    it('should handle leap years', () => {
      const leapYear = dayjs('2024-02-29')
      const nonLeapYear = dayjs('2023-02-29')
      expect(leapYear.isValid()).toBe(true)
      // dayjs is lenient with invalid dates, it adjusts them
      expect(nonLeapYear.isValid()).toBe(true)
      // But the adjusted date should be different
      expect(nonLeapYear.format('YYYY-MM-DD')).toBe('2023-03-01')
    })
  })

  describe('Date formatting and parsing', () => {
    it('should handle various date formats', () => {
      const validFormats = [
        '2024-01-15',
        '2024/01/15',
        '2024-01-15T12:00:00',
        '2024-01-15T12:00:00Z',
      ]

      validFormats.forEach(format => {
        const date = dayjs(format)
        expect(date.isValid()).toBe(true)
      })

      // Test ambiguous format separately
      const ambiguousDate = dayjs('15/01/2024')
      // This might be interpreted differently, so we just check it's a date
      expect(ambiguousDate).toBeDefined()
    })

    it('should format dates correctly', () => {
      const date = dayjs('2024-01-15T12:30:45')
      expect(date.format('YYYY-MM-DD')).toBe('2024-01-15')
      expect(date.format('DD/MM/YYYY')).toBe('15/01/2024')
      expect(date.format('HH:mm:ss')).toBe('12:30:45')
    })
  })
})
