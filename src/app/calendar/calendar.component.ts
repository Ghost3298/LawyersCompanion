import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, OnInit, Output, signal, Signal, WritableSignal } from '@angular/core';
import { DateTime, Info, Interval } from 'luxon';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {

  @Input() appointments: any[] =[];
  @Output() appointmentSelected = new EventEmitter<any>();
  
  onAppointmentClick(appointment: any) {
    this.appointmentSelected.emit(appointment);
  }
  
  today: Signal<DateTime> = signal(DateTime.local());

  firstDayOfActiveMonth: WritableSignal<DateTime> = signal(
    this.today().startOf('month'),
  );

  activeDay: WritableSignal<DateTime | null> = signal(null);
  weekDays: Signal<string[]> = signal(Info.weekdays('short'));

  ngOnInit(): void {
    // Automatically select today's date when component initializes
    this.activeDay.set(this.today());
  }

  daysOfMonth: Signal<DateTime[]> = computed(() => {
    return Interval.fromDateTimes(
      this.firstDayOfActiveMonth().startOf('week'),
      this.firstDayOfActiveMonth().endOf('month').endOf('week'),
    )
      .splitBy({ day: 1 })
      .map((d) => {
        if (d.start === null) {
          throw new Error('Wrong dates');
        }
        return d.start;
      });
  });

  DATE_MED = DateTime.DATE_MED;

  goToPreviousMonth(): void {
    this.firstDayOfActiveMonth.set(
      this.firstDayOfActiveMonth().minus({ month: 1 }),
    );
  }

  goToNextMonth(): void {
    this.firstDayOfActiveMonth.set(
      this.firstDayOfActiveMonth().plus({ month: 1 }),
    );
  }

  goToToday(): void {
    this.firstDayOfActiveMonth.set(this.today().startOf('month'));
    this.activeDay.set(this.today()); 
  }

  getAppointmentsForDay(day: DateTime): any[] {
    if (!this.appointments) return [];
    
    return this.appointments
      .filter(appointment => {
        if (!appointment || !appointment.date) return false;
        
        const appointmentDate = appointment.date instanceof Date 
          ? DateTime.fromJSDate(appointment.date) 
          : DateTime.fromFormat(appointment.date, 'dd-MM-yyyy');
        
        return appointmentDate.isValid && appointmentDate.hasSame(day, 'day');
      })
      .sort((a, b) => {
        const timeA = a.time.hours * 60 + (a.time.minutes || 0);
        const timeB = b.time.hours * 60 + (b.time.minutes || 0);
        return timeA - timeB;
      });
  }

  formatTime(time: { hours: number, minutes: number } | string): string {
    if (typeof time === 'string') return time;
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}