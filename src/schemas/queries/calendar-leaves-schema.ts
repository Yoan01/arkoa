import { z } from 'zod'

import { HalfDayPeriod, LeaveStatus, LeaveType } from '@/generated/prisma'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const membershipSchema = z.object({
  user: userSchema,
})

export const calendarLeaveSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(LeaveType),
  startDate: z.date(),
  endDate: z.date(),
  halfDayPeriod: z.nativeEnum(HalfDayPeriod).nullable().optional(),
  status: z.nativeEnum(LeaveStatus),
  membership: membershipSchema,
})

export const getCalendarLeavesParamsSchema = z.object({
  companyId: z.string(),
  year: z.number().optional(),
  month: z.number().optional(),
})

export const getCalendarLeavesResponseSchema = z.array(calendarLeaveSchema)

export type CalendarLeave = z.infer<typeof calendarLeaveSchema>
export type GetCalendarLeavesParams = z.infer<
  typeof getCalendarLeavesParamsSchema
>
export type GetCalendarLeavesResponse = z.infer<
  typeof getCalendarLeavesResponseSchema
>
