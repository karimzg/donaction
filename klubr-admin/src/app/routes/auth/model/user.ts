import { UserDetail } from "@shared/utils/models/user-details";

export interface Credentials {
  identifier: string;
  password: string;
}

export interface User {
  jwt: string;
  user: UserDetail;
}

export interface NextJsSession extends UserDetail {
  token: string;
}

export type AuthMode = 'nextJs' | 'angular';
