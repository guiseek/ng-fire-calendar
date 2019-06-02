import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogHeaderComponent, DialogContentComponent, CalendarHeaderComponent } from './components';
import { SharedMaterialModule } from './shared-material.module';
import { DialogActionsComponent } from './components/dialog/dialog-actions/dialog-actions.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BottomOptionsComponent } from './components/bottom-options/bottom-options.component';

@NgModule({
  declarations: [
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    CalendarHeaderComponent,
    BottomOptionsComponent
  ],
  imports: [
    CommonModule,
    SharedMaterialModule,
    FlexLayoutModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  exports: [
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    CalendarHeaderComponent,
    BottomOptionsComponent
  ]
})
export class SharedModule { }
