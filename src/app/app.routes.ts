import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { mainRoutes } from './main/main.routes';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    {
        path: '', component: LoginComponent
    },
    {
        path: 'home', component: MainComponent, children:[...mainRoutes]
    },
    {
        path: '**', component: NotFoundComponent
    }
];
