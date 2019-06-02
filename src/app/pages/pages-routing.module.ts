import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesLayoutComponent } from './pages-layout/pages-layout.component';
import { SchedulePageComponent } from './schedule-page/schedule-page.component';
import { CalendarPageComponent } from './calendar-page/calendar-page.component';

const routes: Routes = [{
  path: '',
  component: PagesLayoutComponent,
  children: [{
    path: '',
    component: SchedulePageComponent
  }, {
      path: 'calendario',
    component: CalendarPageComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
