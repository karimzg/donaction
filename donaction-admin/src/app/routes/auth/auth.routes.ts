import { LoginComponent } from './ui/login/login.component'; 
import { AuthComponent } from './ui/auth.component';
import { RegisterComponent } from './ui/register/register.component';

export const routes = [
  {
    path: '',
    component: AuthComponent,
    children:[
      {path:'login',component:LoginComponent},
      {path:'register',component:RegisterComponent}
    ]
  },
  
];
