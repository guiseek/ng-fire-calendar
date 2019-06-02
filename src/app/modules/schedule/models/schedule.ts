import { CalendarEvent } from 'calendar-utils';

export interface Schedule extends CalendarEvent {
  id?: string
  title: string
  color: any
  rrule?: {
    freq: any
    bymonth?: number
    bymonthday?: number
    byweekday?: any
  },
  firstdate: Date
  exdates?: Date[]
}
