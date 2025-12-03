export interface RegisterRequest {
    email: string;
    password?: string;
    username:string;
    nom:string;
    prenom:string;
    provider?:string;
}