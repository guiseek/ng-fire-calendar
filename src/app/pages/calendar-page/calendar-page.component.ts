import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { Observable, BehaviorSubject } from 'rxjs';
import { Schedule } from 'src/app/modules/schedule/models/schedule';
import { ViewPeriod, CalendarEvent } from 'calendar-utils';
import { ScheduleService } from 'src/app/modules/schedule/schedule.service';
import { MatDialog, MatBottomSheet } from '@angular/material';
import { map, shareReplay, take } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { ScheduleCreateDialogComponent, colors, ScheduleUpdateDialogComponent } from 'src/app/modules/schedule';
import { addHours } from 'date-fns';
import RRule, { RRuleSet } from 'rrule';
import { BottomOption, BottomOptionsComponent } from 'src/app/shared';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarPageComponent implements OnInit {
  view = CalendarView.Week
  viewDate: Date = new Date()
  events$: Observable<Schedule[]>
  viewPeriod: ViewPeriod
  private schedule = new BehaviorSubject<Schedule[]>([])
  schedule$ = this.schedule.asObservable().pipe(
    shareReplay(1)
  )
  eventOptions: BottomOption[] = [{
    icon: 'open_in_browser',
    option: 'open',
    title: 'Abrir'
  }, {
    icon: 'edit',
    option: 'update',
    title: 'Alterar recorrência'
  }, {
    icon: 'cancel',
    option: 'cancel',
    title: 'Cancelar como exceção'
  }]
  constructor(
    private service: ScheduleService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private cdr: ChangeDetectorRef
  ) {
    this.events$ = this.findAllEvents()
    this.events$.subscribe((schedule) => {
      if (schedule && !!schedule.length) {
        let events = schedule.filter((event) => !event.rrule)
        if (events) {
          this.addEvents(events)
        }
        let recurrings = schedule.filter((event) => {
          return !!event.rrule
        })
        console.log('recs: ', recurrings)
        if (recurrings && !!recurrings.length) {
          recurrings.forEach((rec) => {

            const rrecs = this.buildRecurrings(rec)
            const rrec = rrecs.shift()
            console.log('rrecs: ', rrecs)
            console.log('rrec: ', rrec)
            this.addEvents(rrecs)
            this.addEvent(rrec)
          })
        }
      }
    })
  }
  findAllEvents() {
    return this.service.findAll().pipe(
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
      take(1),
      shareReplay(1),
    )
  }
  buildRecurrings(e: Schedule): Schedule[] {
    let { rrule, start, end, ...event } = e
    const rruleSet = new RRuleSet()
    // const rule = new RRule({
    //   ...rrule,
    //   dtstart: start,
    //   count: 5
    // })
    rruleSet.rrule(new RRule({
      ...rrule,
      dtstart: start,
      count: 5
    }))

    if (event.exdates) {
      event.exdates.forEach((ex) => {
        if (ex instanceof firestore.Timestamp) {
          rruleSet.exdate(ex.toDate())
        }
      })
    }
    let events: Schedule[] = []

    rruleSet.all().map(date => {
      // if (date > start) {
      return events.push({
        ...event,
        start: date,
        end: addHours(date, 1),
        firstdate: start
      })
    })
    return events
  }
  addEvents(events: Schedule[]) {
    // this.schedule.next([])
    const value = this.schedule.value
    this.schedule.next([...value, ...events])
  }
  addEvent(event: Schedule) {
    const value = this.schedule.value
    this.schedule.next([...value, event])
  }
  ngOnInit() {
  }
  onEventClicked(event: Schedule) {
    console.log(event.id, event)
    const bottomRef = this.bottomSheet.open(BottomOptionsComponent, {
      data: this.eventOptions
    })
    bottomRef.afterDismissed().subscribe((option) => {
      console.log(option)
      if (option) {
        switch(option) {
          case 'update': {
            this.update(event)
            break
          }
          case 'cancel': {
            this.cancel(event)
            break
          }
        }
      }
    })
  }
  cancel({id, start}: Schedule) {
    return this.service.addExDate(id, start)
  }
  create({ date }) {
    const dialogRef = this.dialog.open(ScheduleCreateDialogComponent, {
      panelClass: 'info'
    })
    dialogRef.afterClosed().subscribe((response) => {
      console.log(response)
      if (response) {
        let event: Schedule = {
          title: response.title,
          color: colors.yellow,
          start: date,
          end: addHours(date, 1),
          firstdate: date
        }
        console.log(event)
        this.service.create(event).then((id) => {
          this.addEvent({
            id, ...event
          })
        })
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
        this.service.update(response).then(() => {
          this.addEvents(
            this.buildRecurrings(response)
          )
        })
      }
    })
  }
}
