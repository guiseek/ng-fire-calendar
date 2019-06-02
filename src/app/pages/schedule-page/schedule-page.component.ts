import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import RRule from 'rrule';
import { getMonth, isSameDay, startOfDay, endOfDay, addHours } from 'date-fns'
import {
  CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent
} from 'angular-calendar';
// import { colors } from '../demo-utils/colors';
import { ViewPeriod } from 'calendar-utils';
import { colors } from 'src/app/modules/schedule';
import { ScheduleService } from 'src/app/modules/schedule/schedule.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ScheduleCreateDialogComponent, ScheduleUpdateDialogComponent } from 'src/app/modules/schedule';
import { Observable, concat, of, forkJoin } from 'rxjs';
import { map, mergeMap, merge, tap, take, switchMap, filter, mergeMapTo, switchMapTo, shareReplay, concatMap, concatMapTo } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { Schedule } from 'src/app/modules/schedule/models/schedule';

interface RecurringEvent {
  title: string;
  color: any;
  rrule?: {
    freq: any;
    bymonth?: number;
    bymonthday?: number;
    byweekday?: any;
  };
}

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.scss'],
  encapsulation: ViewEncapsulation.None
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchedulePageComponent implements OnInit {
  view = CalendarView.Week
  viewDate: Date = new Date()

  recurringEvents: RecurringEvent[] = [
    {
      title: 'Recurs on the 5th of each month',
      color: colors.yellow,
      rrule: {
        freq: RRule.MONTHLY,
        bymonthday: 5
      }
    },
    {
      title: 'Recurs yearly on the 10th of the current month',
      color: colors.blue,
      rrule: {
        freq: RRule.YEARLY,
        bymonth: getMonth(this.viewDate),
        // bymonth: moment().month() + 1,
        bymonthday: 10
      }
    },
    {
      title: 'Recurs weekly on mondays',
      color: colors.red,
      rrule: {
        freq: RRule.WEEKLY,
        byweekday: [RRule.MO]
      }
    }
  ];
  refresh() {
    this.calendarEvents = [...this.calendarEvents];
    this.cdr.detectChanges();
  }
  calendarEvents: CalendarEvent[] = [];

  events$: Observable<Schedule[]> | Observable<any[]>
  viewPeriod: ViewPeriod;
  dialogRef: MatDialogRef<ScheduleCreateDialogComponent>
  constructor(
    private service: ScheduleService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    const schedule$ = this.service.findAll().pipe(
      map((events: Schedule[]) => {
        return events.map((event: Schedule) => {
          let { start, end, ...data } = event
          if (start instanceof firestore.Timestamp) {
            start = start.toDate()
          }
          if (end instanceof firestore.Timestamp) {
            end = end.toDate()
          }
          return {
            ...data, start, end
          }
        })
      }),
      // take(1),
      // shareReplay(1)
    )
    // schedule$.subscribe((schedule) => {
    //   console.log('sub')
    //   if (!schedule) {
    //     this.events$ = of([])
    //   }
    // })
    const recurringEvents$ = schedule$.pipe(
      // map(events => events.filter(event => !!event.rrule)),
      map((events) => {
        return events.map(event => {
          // if (!!event.rrule) {
            return this.formatRRuleEvent(event)
          // } else {
          //   return null
          // }
        })
      })
    )
    const events$ = schedule$.pipe(
      // map(events => events.filter(event => event.rrule != undefined)),
      map(events => {
        return events.map(event => {
          // if (!!!event.rrule) {
            console.log(event.rrule)
            return this.formatEvent(event)
          // } else {
          //   return null
          // }
        })
      })
    )
    this.events$ = concat(events$, recurringEvents$).pipe(
      map(([events, recurrings]) => {
        return {events, recurrings}
      }),
      map((value) => {
        let { events, recurrings } = value
        console.log('events', events)
        console.log('recurrings', recurrings)
        return [events, recurrings]
      }),
      mergeMap(([events, recurrings]) => {
        events = this.formatEvent(events)
        recurrings = this.formatRRuleEvent(recurrings)
        console.log('events', events)
        console.log('recurrings', recurrings)
        let a = []
        a = a.concat(recurrings).concat([events])
        console.log(a)
        return [a]
      }),
      take(1)
    )
    // this.events$.subscribe((e) => {
    //   console.table(e)
    // })
    // this.events$.subscribe((response) => {
    //   console.log('r: ', response)
    //   // let { events, recurrings } = response
    //   // console.log(events, recurrings)

    //   // let schedule = []
    //   // if (!!events[0]) {
    //   //   console.log('schedule = schedule.concat(events)')
    //   //   schedule = schedule.concat(events)
    //   // }
    //   // if (!!recurrings) {
    //   //   console.log('schedule = schedule.concat(recurrings)')
    //   //   schedule = schedule.concat(recurrings)
    //   // }

    //   // let events = []
    //   this.events$ = of(response)
    //   // this.events$.subscribe((evs) => {
    //   //   console.table(evs)
    //   // })
    // })
    // this.events$ = this.service.findAll().pipe(
    //   map(events => {
    //     return events.map(event => {
    //       let { start, end, ...data } = event
    //       if (start instanceof firestore.Timestamp) {
    //         start = start.toDate()
    //       }
    //       if (end instanceof firestore.Timestamp) {
    //         end = end.toDate()
    //       }
    //       return {
    //         ...data, start, end
    //       }
    //     })
    //   }),
    //   // filter((events) => events.filter(event => !!event.rrule)),
    //   filter(events => !!events),
    //   // map((events) => {
    //   //   console.log(events)
    //   //   // let er = events.filter((r) => !!r.rrule)
    //   //   // let eer = er.map(r => this.formatRRuleEvent(r))
    //   //   let e = events.filter((r) => !r.rrule)
    //   //   let ee = e.map(e => this.formatEvent(e))
    //   //   // console.log('eer: ', eer)
    //   //   console.log('ee: ', ee)
    //   //   return [...events, ...ee]
    //   //   // return events
    //   //   // console.log({...eer, ...ee})
    //   //   // return [...eer, ...ee]
    //   //   // return events.map((event) => {
    //   //   //   let { rrule, start, end, ...data } = event
    //   //   //   if (rrule) {
    //   //   //     const rule = new RRule({
    //   //   //       ...rrule,
    //   //   //       dtstart: start,
    //   //   //       count: 30
    //   //   //     })
    //   //   //     return rule.all().map(date => {
    //   //   //       console.log(date)
    //   //   //       return {
    //   //   //         ...data,
    //   //   //         start: date,
    //   //   //         end: addHours(date, 1)
    //   //   //       }
    //   //   //     })
    //   //   //   // } else {
    //   //   //   //   return [{
    //   //   //   //     ...data,
    //   //   //   //     start,
    //   //   //   //     end: addHours(start, 1)
    //   //   //   //   }]
    //   //   //   }
    //   //   // })
    //   //   // return evts
    //   // }),
    //   switchMap((events) => {
    //     console.log('...: ', events)
    //     let er = events.filter((r) => !!r.rrule)
    //     let eer = er.map(r => this.formatRRuleEvent(r))
    //     // return eer
    //     return eer
    //   }),
    //   // filter(events => !!events && !!events.length),
    //   // mergeMapTo((events) => {
    //   //   console.log('e: ', events)
    //   //   return events
    //   // }),
    //   tap(events => {
    //     console.log('events: ', events)
    //   })
    // )
  }
  formatEvent(event): Schedule[] {
    let { start, end, ...data } = event
    return {
      ...data,
      start,
      end: addHours(start, 1)
    }
  }
  formatRRuleEvent(event): Schedule[] {
    let { rrule, start, end, ...data } = event
    const rule = new RRule({
      ...rrule,
      dtstart: start,
      count: 30
    })
    return rule.all().map(date => {
      console.log(date)
      return {
        ...data,
        start: date,
        end: addHours(date, 1)
      }
    })
  }
  ngOnInit() {
  }
  create({ date }) {
    this.dialogRef = this.dialog.open(ScheduleCreateDialogComponent, {
      panelClass: 'info'
    })
    this.dialogRef.afterClosed().subscribe((response) => {
      console.log(response)
      if (response) {
        let event: Schedule = {
          // id: this.calendarEvents.length + 1,
          title: response.title,
          color: colors.yellow,
          start: date,
          end: addHours(date, 1),
          firstdate: date
        }
        console.log(event)
        this.calendarEvents.push(event)
        this.service.create(event)
        this.refresh()
        // this.cdr.detectChanges()
      }
    })
  }
  remove(data) {
    this.service.remove(data.id)
  }
  update(data: CalendarEvent) {
    console.log(data)
    const dialogRef = this.dialog.open(ScheduleUpdateDialogComponent, {
      data, panelClass: 'info'
    })
    dialogRef.afterClosed().subscribe((response) => {
      console.log(response)
      if (response) {
        this.service.update(response)
      }
    })
  }
  updateCalendarEvents(
    viewRender:
      | CalendarMonthViewBeforeRenderEvent
      | CalendarWeekViewBeforeRenderEvent
      | CalendarDayViewBeforeRenderEvent
  ): void {
    if (
      !this.viewPeriod ||
      !isSameDay(this.viewPeriod.start, viewRender.period.start) ||
      !isSameDay(this.viewPeriod.end, viewRender.period.end)
      // !moment(this.viewPeriod.start).isSame(viewRender.period.start) ||
      // !moment(this.viewPeriod.end).isSame(viewRender.period.end)
    ) {
      this.viewPeriod = viewRender.period;
      this.calendarEvents = [];

      this.recurringEvents.forEach(event => {
        const rule: RRule = new RRule({
          ...event.rrule,
          dtstart: startOfDay(viewRender.period.start),
          until: endOfDay(viewRender.period.end)
          // dtstart: moment(viewRender.period.start)
          //   .startOf('day')
          //   .toDate(),
          // until: moment(viewRender.period.end)
          //   .endOf('day')
          //   .toDate()
        });
        const { title, color } = event;

        rule.all().forEach(date => {
          this.calendarEvents.push({
            title,
            color,
            start: date
            // start: moment(date).toDate()
          });
        });
      });
      this.cdr.detectChanges();
    }
  }
}
