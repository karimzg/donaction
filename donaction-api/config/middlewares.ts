export default [
  // 'strapi::logger',
  // {
  //   name: "strapi::logger",
  //   config: {
  //     level: "info",
  //   },
  // },
  "global::request-logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  // Attente résolution bug STRAPI : https://github.com/strapi/strapi/issues/14357
  // {
  //   name: 'strapi::cors',
  //   config: {
  //     origin: ['https://re7.donaction.fr', 'https://www.donaction.fr', 'https://donaction.fr', 'http://localhost:3100'],
  //     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  //     headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  //     keepHeaderOnError: true,
  //   },
  // },
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      formLimit: "20mb", // Limit for regular form body
      jsonLimit: "20mb", // Limit for JSON body
      textLimit: "20mb", // Limit for text body
      formidable: {
        maxFileSize: 40 * 1024 * 1024, // Set max file size to 40MB, adjust as needed
      },
      cors: {
        enabled: true,
      },
      multipart: true,
      patchKoa: true,
      includeUnparsed: true,
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "ik.imagekit.io",
            "res.cloudinary.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "ik.imagekit.io",
            "res.cloudinary.com",
          ],
          "script-src": ["'self'", "'unsafe-inline'", "maps.googleapis.com"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];
