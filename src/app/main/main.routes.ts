import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ScheduleComponent } from '../schedule/schedule.component';
import { LibraryComponent } from '../library/library.component';
import { ProfileComponent } from '../profile/profile.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { PaymentsComponent } from '../payments/payments.component';

export const mainRoutes: Routes = [
    {
        path: '', component: DashboardComponent
    },
    {
        path: 'schedule', component: ScheduleComponent
    },
    {
        path: 'library', component: LibraryComponent
    },
    {
        path: 'profile', component: ProfileComponent
    },
    {
        path: 'payments/:folderId', component: PaymentsComponent
    },
    {
        path: '**', component: NotFoundComponent
    }
]