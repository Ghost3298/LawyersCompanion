import { Component } from '@angular/core';
import { SplitScreenComponent } from "../shared/layouts/split-screen/split-screen.component";
import { CalendarComponent } from "../calendar/calendar.component";

@Component({
  selector: 'app-schedule',
  imports: [SplitScreenComponent, CalendarComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {

}
