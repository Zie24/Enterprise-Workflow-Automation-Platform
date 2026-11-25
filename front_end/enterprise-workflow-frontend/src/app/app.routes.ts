import { RegisterComponent } from './features/register/register.component';
import { Routes } from '@angular/router';

import { AccountComponent } from './features/account/account.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { MainLayoutComponent } from './features/Main-Layout/Main-Layout.component';
import { TaskListComponent } from './features/task-list/task-list.component';
import { TeamsComponent } from './features/teams/teams.component';

import { authGuard } from './core/guards/auth.guard';
import { RequestListComponent } from './features/requests/request-list/request-list.component';
import { CreateRequestComponent } from './features/requests/create-request/create-request.component';
import { LandingComponent } from './features/landing/landing.component';
import { RequestDetailsComponent } from './features/requests/request-details/request-details.component';
import { TaskDetailsComponent } from './features/task-details/task-details.component';
import { VerifyOtpComponent } from './features/verify-otp/verify-otp/verify-otp.component';
import { SettingsComponent } from './features/Settings/Settings.component'

export const routes: Routes = [

  {
    path: 'landing',
    component: LandingComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },
{ path: 'settings', component: SettingsComponent },

{ path: 'verify-otp', component: VerifyOtpComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],

    children: [

      {
        path: 'dashboard',
        component: DashboardComponent
      },

      {
        path: 'account',
        component: AccountComponent
      },

      {
        path: 'tasks',
        component: TaskListComponent
      },{
  path: 'tasks/:id',
  component: TaskDetailsComponent
},

      {
        path: 'teams',
        component: TeamsComponent
      },
      {
  path: 'requests',
  component: RequestListComponent
},
{
  path: 'requests/create',
  component: CreateRequestComponent
},{
  path: 'requests/:id',
  component: RequestDetailsComponent
}

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
