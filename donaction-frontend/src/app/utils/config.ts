// File: config.ts

// TODO: check if really usefull
interface Config {
    databaseHost: string;
    databasePort: number;
    databaseName: string;
    databaseUsername: string;
    databasePassword: string;
    databaseClient: string;
    pgAdminDefaultEmail: string;
    pgAdminDefaultPassword: string;
    jwtSecret: string;
    apiTokenSalt: string;
    apiUrl: string;
    databaseUrl: string;
    nextAuthUrl: string;
    googleClientId: string;
    environment: string;
    emailServerUser: string;
    emailServerPassword: string;
    emailServerHost: string;
    emailServerPort: number;
    emailFrom: string;
    googleClientSecret:string
    googleSecret:string;
  }

  const configEnv: Config = {
    databaseHost: 'localhost',
    databasePort: 5432,
    databaseName: 'klubr-app',
    databaseUsername: 'postgres',
    databasePassword: '22624265',
    databaseClient: 'postgres',
    pgAdminDefaultEmail: 'admin@admin.com',
    pgAdminDefaultPassword: 'root',
    jwtSecret: '4kF4QMfpfadDzmPbnAPO7g==',
    apiTokenSalt: 'IGG4b1ZmURiReLHMzm6VOg==',
    apiUrl:  'http://localhost:1337',
    databaseUrl:   'postgres://klubrapi:klubrapi@localhost:5432/strapi?synchronize=true',
    nextAuthUrl:  'https://re7.donaction.fr',
    googleClientId:'1036173262198-n0rq5p6vj4ju6mgdr8j9dmur4i3v7iah.apps.googleusercontent.com',
    googleClientSecret:"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",
    googleSecret:'4kF4QMfpfadDzmPbnAPO7g',
    environment: 'development',
    emailServerUser: 'klubrklubr8@gmail.com',
    emailServerPassword: 'ddtf inrs eytd rzcv',
    emailServerHost: 'smtp.example.com',
    emailServerPort: 587,
    emailFrom: 'klubrklubr8@gmail.com',

  };

  export default configEnv;
