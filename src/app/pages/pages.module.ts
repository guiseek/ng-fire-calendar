import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { SchedulePageComponent } from './schedule-page/schedule-page.component';
import { PagesLayoutComponent } from './pages-layout/pages-layout.component';
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedMaterialModule } from '../shared/shared-material.module';
import { SharedModule } from '../shared/shared.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ScheduleModule } from '../modules/schedule/schedule.module';
import { CalendarPageComponent } from './calendar-page/calendar-page.component';
import { BottomOptionsComponent } from '../shared';

@NgModule({
  declarations: [SchedulePageComponent, PagesLayoutComponent, CalendarPageComponent],
  imports: [
    CommonModule,
    PagesRoutingModule,
    LayoutModule,
    FlexLayoutModule,
    SharedMaterialModule,
    SharedModule,
    ScheduleModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
  entryComponents: [
    BottomOptionsComponent
  ]
})
export class PagesModule { }
