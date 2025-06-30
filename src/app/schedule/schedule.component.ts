import { Component } from '@angular/core';
import { SplitScreenComponent } from "../shared/layouts/split-screen/split-screen.component";
import { CalendarComponent } from "../calendar/calendar.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { DateTime } from 'luxon';
import { PopupFormComponent } from "../shared/popup-form/popup-form.component";

interface AppointmentFormData {
  clientId?: string | null;
  clientName?: string | null;
  folderId?: string | null;
  folderName?: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  notes: string | null;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    SplitScreenComponent,
    CalendarComponent,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    PopupFormComponent
],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
  providers: [DatePipe]
})
export class ScheduleComponent {
   appointments: any[] = [];
  clients: any[] = [];
  folders: any[] = [];
  selectedDate: DateTime = DateTime.local();
  selectedAppointment: any = null;
  showAppointmentForm = false;
  appointmentForm: FormGroup;
  public useExternalClient: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.appointmentForm = this.fb.group({
      clientId: [''],
      clientName: [''],
      folderId: [''],
      folderName: [''],
      date: [this.datePipe.transform(this.selectedDate.toJSDate(), 'yyyy-MM-dd'), Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadAppointments();
    this.setupNotificationCheck();
    this.toggleClientType(false);
  }

  onDateSelected(date: DateTime): void {
    this.selectedDate = date;
    this.loadAppointments();
  }

  loadAppointments(): void {
    const dateStr = this.datePipe.transform(this.selectedDate.toJSDate(), 'yyyy-MM-dd');
    this.http.get<any[]>(`http://localhost:3000/api/appointments?date=${dateStr}`).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
      },
      error: (err) => console.error(err)
    });
  }

  loadClients(): void {
    this.http.get<any[]>('http://localhost:3000/api/customers').subscribe(clients => {
      this.clients = clients;
    });
  }

  loadFolders(clientId: string): void {
    if (!clientId) return;
    this.http.get<any[]>(`http://localhost:3000/api/clients/${clientId}/folders`).subscribe(folders => {
      this.folders = folders;
    });
  }

  onClientSelect(): void {
    const clientId = this.appointmentForm.get('clientId')?.value;
    this.loadFolders(clientId);
  }

  openAppointmentForm(date: DateTime): void {
    this.appointmentForm.reset();
    this.appointmentForm.patchValue({
      date: this.datePipe.transform(date.toJSDate(), 'yyyy-MM-dd')
    });
    this.showAppointmentForm = true;
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;

    const formData = {
      ...this.appointmentForm.value,
      isExternalClient: this.useExternalClient,
      date: new Date(this.appointmentForm.value.date)
    };

    if (this.useExternalClient) {
      formData.clientName = this.appointmentForm.value.clientName;
      delete formData.clientId;
      delete formData.folderId;
    } else {
      formData.clientId = this.appointmentForm.value.clientId;
      delete formData.clientName;
      delete formData.folderName;
    }

    this.http.post('http://localhost:3000/api/appointments', formData).subscribe({
      next: () => {
        this.loadAppointments();
        this.showAppointmentForm = false;
        this.appointmentForm.reset();
      },
      error: (err) => console.error(err)
    });
  }

  selectAppointment(appointment: any): void {
    this.selectedAppointment = appointment;
  }

  editAppointment(appointment: any): void {
  if (!appointment) return;

  this.useExternalClient = appointment.isExternalClient;
  
  // Initialize formData with proper typing
  const formData: Partial<AppointmentFormData> = {
    date: this.datePipe.transform(appointment.date, 'yyyy-MM-dd'),
    time: appointment.time,
    location: appointment.location,
    notes: appointment.notes || null
  };

  const clientNameControl = this.appointmentForm.get('clientName');
  const clientIdControl = this.appointmentForm.get('clientId');

  if (!clientNameControl || !clientIdControl) {
    console.error('Form controls not found');
    return;
  }

  if (this.useExternalClient) {
    formData.clientName = appointment.clientName || null;
    formData.folderName = appointment.folderName || null;
    
    clientNameControl.setValidators([Validators.required]);
    clientIdControl.clearValidators();
    
    // Clear folderId for external clients
    this.appointmentForm.patchValue({ folderId: null });
  } else {
    formData.clientId = appointment.clientId?._id || null;
    formData.folderId = appointment.folderId?._id || null;
    
    clientIdControl.setValidators([Validators.required]);
    clientNameControl.clearValidators();
    
    // Clear folderName for registered clients
    this.appointmentForm.patchValue({ folderName: null });
    
    if (appointment.clientId?._id) {
      this.loadFolders(appointment.clientId._id);
    }
  }

  // Update form validity
  clientNameControl.updateValueAndValidity();
  clientIdControl.updateValueAndValidity();

  // Patch the form values
  this.appointmentForm.patchValue(formData);
  this.showAppointmentForm = true;
  this.selectedAppointment = null;
}

  deleteAppointment(id: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.http.delete(`http://localhost:3000/api/appointments/${id}`).subscribe({
        next: () => {
          this.loadAppointments();
          this.selectedAppointment = null;
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleClientType(isExternal: boolean): void {
    this.useExternalClient = isExternal;
    
    const clientIdControl = this.appointmentForm.get('clientId');
    const clientNameControl = this.appointmentForm.get('clientName');

    if (!clientIdControl || !clientNameControl) {
      console.error('Form controls not found');
      return;
    }

    if (isExternal) {
      clientIdControl.clearValidators();
      clientNameControl.setValidators([Validators.required]);
    } else {
      clientIdControl.setValidators([Validators.required]);
      clientNameControl.clearValidators();
    }

    clientIdControl.updateValueAndValidity();
    clientNameControl.updateValueAndValidity();
  }

  private setupNotificationCheck(): void {
    setInterval(() => {
      this.checkForNotifications();
    }, 60000);
  }

  private checkForNotifications(): void {
    const now = DateTime.local();
    const in30Minutes = now.plus({ minutes: 30 });
    
    const dateStr = this.datePipe.transform(now.toJSDate(), 'yyyy-MM-dd');
    this.http.get<any[]>(`http://localhost:3000/api/appointments?date=${dateStr}`).subscribe(appointments => {
      appointments.forEach(appointment => {
        if (!appointment.date || !appointment.time) return;
        
        const appointmentTime = DateTime.fromISO(`${appointment.date}T${appointment.time}`);
        
        if (appointmentTime > now && appointmentTime <= in30Minutes && !appointment.notified) {
          this.showNotification(appointment);
          this.http.put(`http://localhost:3000/api/appointments/${appointment._id}`, { notified: true }).subscribe();
        }
      });
    });
  }

  private showNotification(appointment: any): void {
    if (Notification.permission === 'granted') {
      const clientName = appointment.isExternalClient ? 
        appointment.clientName : 
        `${appointment.clientId?.firstName} ${appointment.clientId?.lastName}`;
      
      new Notification('Upcoming Appointment', {
        body: `You have an appointment at ${appointment.time} for ${clientName} at ${appointment.location}`
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showNotification(appointment);
        }
      });
    }
  }
}