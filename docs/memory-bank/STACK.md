---
name: stack
description: Technology stack documentation
argument-hint: N/A
---

# Stack

## donaction-frontend

@donaction-frontend/package.json

- Next.js 14 (React framework)
- React 18
- TypeScript 5
- NextAuth 4 (authentication)
- Redux Toolkit 2 (state management)
- Stripe 14 + Stripe React 2 (payments)
- PrimeReact 10 (UI components)
- TailwindCSS 3 (styling)
- date-fns 2 (date utilities)
- jose 5 (JWT handling)
- Sharp 0.33 (image optimization)
- Swiper 11 (carousels)

@donaction-frontend/next.config.js

- Standalone output mode
- Bundle analyzer support
- Custom image domains: `googleusercontent.com`, `cloudinary.com`, `imagekit.io`

@donaction-frontend/tsconfig.json

- Target: ES6
- Path aliases: `@/components/*`, `@/helpers/*`, `@/*`
- Strict mode enabled

## donaction-admin

@donaction-admin/package.json

- Angular 19
- TypeScript 5
- RxJS 7
- NgRx 19 (state management)
- PrimeNG 19 + PrimeFlex 4 (UI components)
- TailwindCSS 3 (styling)
- Google Maps integration via `@angular/google-maps`
- ngx-editor 18 (rich text editor)
- ngx-image-cropper 9
- ngx-lottie 13 (animations)
- Jasmine 5 + Karma 6 (testing)

@donaction-admin/angular.json

- Builder: `@angular-devkit/build-angular:application`
- Style preprocessor: SCSS
- Service worker: PWA enabled via `ngsw-config.json`
- Multiple environments: `production`, `development`, `re7`

@donaction-admin/tsconfig.json

- Target: ES2022
- Strict mode with all strict flags
- Path aliases: `@app/*`, `@assets/*`, `@environments/*`, `@shared/*`

## donaction-saas

@donaction-saas/package.json

- Svelte 5 (web components)
- TypeScript 5
- Vite 5 (build tool)
- Vitest 2 (testing)
- Stripe JS 4
- Swiper 11 (carousels)

@donaction-saas/vite.config.ts

- Custom element compilation for web components
- Multiple build modes: INDIVIDUAL (ESM) and IIFE
- Outputs to `build/donaction-web-components`

@donaction-saas/tsconfig.json

- Target: ESNext
- Extends `@tsconfig/svelte`

## donaction-api

@donaction-api/package.json

- Strapi 5 (headless CMS)
- Node.js 18-22
- TypeScript 5
- PostgreSQL 8 (`pg` driver)
- Stripe 17 (payments)
- React 18 + React Router 6 (admin panel)
- Sharp 0.33 (image processing)
- ImageKit 6 (media hosting)
- pdf-lib 1 (PDF generation)
- xlsx 0.18 (Excel handling)
- Nodemailer (email provider)
- Sendinblue API v3 SDK (`sib-api-v3-sdk`)

## Shared Dependencies

- Node.js >= 18
- TypeScript 5 across all projects
- Sass/SCSS for styling
- Sharp for image processing
- Lottie for animations
- Google Maps API integration
- Stripe SDK for payments
