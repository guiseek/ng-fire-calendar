import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-schedule-create-dialog',
  templateUrl: './schedule-create-dialog.component.html',
  styleUrls: ['./schedule-create-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScheduleCreateDialogComponent implements OnInit {
  form = this.fb.group({
    id: [],
    title: [null, Validators.required],
    description: []
  })
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ScheduleCreateDialogComponent>
  ) { }
  ngOnInit() {
  }
  onClose() {
    this.form.markAsDirty()
    this.form.markAllAsTouched()
    if (this.form.valid) {
      this.dialogRef.close(this.form.value)
    }
  }
}
