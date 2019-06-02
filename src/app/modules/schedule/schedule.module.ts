import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from './schedule.service';
import { ScheduleUpdateDialogComponent } from './components/schedule-update-dialog/schedule-update-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ScheduleCreateDialogComponent } from './components/schedule-create-dialog/schedule-create-dialog.component';

@NgModule({
  declarations: [ScheduleUpdateDialogComponent, ScheduleCreateDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    SharedModule,
    FlexLayoutModule
  ],
  providers: [
    ScheduleService
  ],
  exports: [ScheduleUpdateDialogComponent, ScheduleCreateDialogComponent],
  entryComponents: [
    ScheduleCreateDialogComponent,
    ScheduleUpdateDialogComponent
  ]
})
export class ScheduleModule { }
