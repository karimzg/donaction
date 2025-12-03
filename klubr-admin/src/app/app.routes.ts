import { Routes } from '@angular/router';
import { authGuard } from '@shared/utils/guards/auth.guard';
import { invitationCodeGuard } from "@shared/utils/guards/invitation-code.guard";

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth/auth.routes').then(m => m.routes),
  },
  {
    path: 'link-member/:code',
    loadComponent: () => import('./shared/components/member/link-member/link-member.component').then(m => m.LinkMemberComponent),
    canActivate: [authGuard],
  },
  {
    path: 'link-member',
    loadComponent: () => import('./shared/components/member/link-member/link-member.component').then(m => m.LinkMemberComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    canActivate: [authGuard, invitationCodeGuard],
    loadComponent: () => import('./routes/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./routes/homepage/homepage.component').then(m => m.HomepageComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./routes/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'klub',
        loadChildren: () => import('./routes/klub/klub.routes').then(m => m.routes),
      },
      {
        path: 'statistiques',
        loadChildren: () => import('./routes/stats/stats.routes').then(m => m.routes),
      },
      {
        path: 'klub-house',
        loadChildren: () => import('./routes/klub-house/klub-house.routes').then(m => m.routes),
      },
      {
        path: 'profile',
        loadChildren: () => import('./routes/profile/profile.routes').then(m => m.routes),
      },
      {
        path: 'project',
        loadChildren: () => import('./routes/project/project.routes').then(m => m.routes),
      },
      {
        path: 'members',
        loadChildren: () => import('./routes/members/members.routes').then(m => m.routes),
      },
      {
        path: 'users',
        loadChildren: () => import('./routes/users/users.routes').then(m => m.routes),
      },
      {
        path: 'don',
        loadChildren: () => import('./routes/don/don.routes').then(m => m.routes),
      },
      {
        path: 'facturation',
        loadChildren: () => import('./routes/facturation/facturation.routes').then(m => m.routes),
      },
      {
        path: 'supports',
        loadChildren: () => import('./routes/supports/supports.routes').then(m => m.routes),
      },
      {
        path: 'aide',
        loadChildren: () => import('./routes/help-center/help-center.routes').then(m => m.routes),
      },
      {
        path: 'admin-sandbox',
        loadChildren: () => import('./routes/admin-sandbox/admin-sandbox.routes').then(m => m.routes),
      },
      {
        path: 'edit-account',
        loadComponent: () => import('./routes/edit-account/edit-account.component').then(m => m.EditAccountComponent),
      },
    ],
  },

  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {path: '**', redirectTo: ''}
];

