import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatCheckboxChange } from '@angular/material';
import { CalendarEvent } from 'calendar-utils';
import { firestore } from 'firebase/app';
import RRule, { Weekday } from 'rrule';
import { getDay } from 'date-fns';
import { Schedule } from '../../models/schedule';
import { datetime } from '../../constants/datetime';

@Component({
  selector: 'app-schedule-update-dialog',
  templateUrl: './schedule-update-dialog.component.html',
  styleUrls: ['./schedule-update-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScheduleUpdateDialogComponent implements OnInit {
  form = this.fb.group({
    id: [null, Validators.required],
    start: [null, Validators.required],
    end: [null, Validators.required],
    title: [null, Validators.required],
    allDay: [],
    rrule: this.fb.group({
      freq: [],
      byweekday: [{ value: '', disabled: true }],
      bymonthday: [{ value: '', disabled: true }],
      interval: [1]
    }),
    description: []
  })
  rruleOptions = [{
    value: '', viewValue: 'Não se repete'
  }, {
    value: RRule.DAILY, viewValue: 'Todos os dias'
  }, {
      value: RRule.WEEKLY, viewValue: 'Semanal, cada ', paramValue: null
  }, {
      value: RRule.MONTHLY, viewValue: 'Mensal ', paramValue: null
  }]
  repeatControl = new FormControl
  weekdays = datetime.weekdays
  primaryWeekday: Weekday
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ScheduleUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Schedule
  ) { }
  get rrule(): FormControl {
    return this.form.get('rrule') as FormControl
  }
  get start(): FormControl {
    return this.form.get('start') as FormControl
  }
  ngOnInit() {
    let { start, end, rrule, ...event } = this.data
    console.log('event.allDay: ', event.allDay)
    this.primaryWeekday = this.getWeekDay(start)
    if (!rrule) {
      this.repeatControl.patchValue(this.rruleOptions[0].value)
    }
    if (start instanceof firestore.Timestamp) start = start.toDate()
    if (end instanceof firestore.Timestamp) end = end.toDate()
    this.form.patchValue({
      ...event, start, end
    })
    this.rruleOptions[2].paramValue = start

    // this.rruleOptions[2].paramValue = new Weekday(getDay(start)).getJsWeekday()
  }
  changeAllDay(value: MatCheckboxChange) {
    console.log('changeAllDay: ', value)
    // if (value.checked)
  }
  changeRepeat(value) {
    console.log(value)
    if (!!value) {
      if (this.rrule.status == 'DISABLED') {
        this.rrule.enable()
      }
    } else {
      return this.rrule.disable()
    }
    this.rrule.get('freq').patchValue(value)
    switch (value) {
      case RRule.DAILY: {
        this.rrule.get('byweekday').disable()
        this.rrule.get('bymonthday').disable()
        break
      }
      case RRule.WEEKLY: {
        console.log('byweekday: ', new Weekday(getDay(this.start.value)).weekday)
        this.rrule.get('bymonthday').disable()
        this.rrule.get('byweekday').enable()
        this.rrule.get('byweekday').patchValue(
          [this.primaryWeekday]
        )
        break
      }
    }
    this.buildRepeat(this.rrule.value)

  }
  getWeekDay(date: Date) {
    return this.weekdays.find((wd, i) => {
      return i == getDay(date)
    }).value
  }
  panelOpenState = false
  repeat: Date[]
  buildRepeat(data) {
    this.repeat = []
    const rrule = new RRule({
      ...data,
      count: 10
    })
    this.repeat = rrule.all()
  }
  onClose() {
    this.form.markAsDirty()
    this.form.markAllAsTouched()
    console.log(this.form.valid)
    console.log(this.form.value)
    if (this.form.valid) {
      let { rrule, ...event } = this.form.value
      if (rrule.byweekday) {
        rrule.byweekday = rrule.byweekday.map((wd) => {
          return wd.weekday
        })
      }
      this.dialogRef.close({
        ...event, rrule
      })
      // this.dialogRef.close(this.form.value)
    }
  }
  onRemove() {

  }
}
