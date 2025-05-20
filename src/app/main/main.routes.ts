import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ScheduleComponent } from '../schedule/schedule.component';
import { LibraryComponent } from '../library/library.component';
import { ProfileComponent } from '../profile/profile.component';
import { NotFoundComponent } from '../not-found/not-found.component';

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
        path: '**', component: NotFoundComponent
    }
]