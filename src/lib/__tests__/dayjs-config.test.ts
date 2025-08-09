import 'dayjs/locale/fr'
import '../dayjs-config'

import dayjs from 'dayjs'
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
  it('should have French locale configured', () => {
    dayjs.locale('fr')
    const date = dayjs('2024-01-15')
    expect(date.locale()).toBe('fr')
  })

  it('should have isBetween plugin available', () => {
    const date1 = dayjs('2024-01-15')
    const date2 = dayjs('2024-01-10')
    const date3 = dayjs('2024-01-20')
    expect(date1.isBetween(date2, date3)).toBe(true)
  })

  it('should have isoWeek plugin available', () => {
    const date = dayjs('2024-01-15')
    expect(typeof date.isoWeek()).toBe('number')
    expect(date.isoWeek()).toBeGreaterThan(0)
  })

  it('should have weekday plugin available', () => {
    const date = dayjs('2024-01-15')
    expect(typeof date.weekday()).toBe('number')
    expect(date.weekday()).toBeGreaterThanOrEqual(0)
    expect(date.weekday()).toBeLessThan(7)
  })

  it('should have utc plugin available', () => {
    const date = dayjs('2024-01-15')
    const utcDate = date.utc()
    expect(utcDate.isValid()).toBe(true)
  })

  it('should have timezone plugin available', () => {
    const date = dayjs('2024-01-15')
    const parisDate = date.tz('Europe/Paris')
    expect(parisDate.isValid()).toBe(true)
  })

  it('should handle date formatting', () => {
    const date = dayjs('2024-01-15')
    expect(date.format('YYYY-MM-DD')).toBe('2024-01-15')
    expect(date.isValid()).toBe(true)
  })
})
