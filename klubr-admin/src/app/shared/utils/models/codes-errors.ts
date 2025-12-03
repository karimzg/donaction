export enum HttpStatusCode {
    OK = 200,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    InternalServerError = 500,
  }
  
  // Generic Error Interface
  export interface HttpError {
    status: HttpStatusCode;
    message: string;
    name:string;
    details?: any; 
  }