---
name: codebase-structure
description: Project structure documentation
argument-hint: N/A
---

# Codebase Structure

## Root Directory

- **donaction-frontend**: Next.js web application for public-facing site
- **donaction-api**: Strapi CMS backend API
- **donaction-admin**: Angular admin dashboard application
- **donaction-saas**: Svelte web components for embeddable widgets
- **aidd**: AI-driven development configuration and agents
- **docs**: Project documentation including agents, rules, flows, memory-bank
- **cicd**: CI/CD pipeline configurations
- **.github**: GitHub workflows and configurations
- **http-requests**: HTTP request examples for testing
- **logs**: Application logs per module

## Configuration Files

- @.gitlab-ci.yml: GitLab CI/CD pipeline configuration
- @docker-compose.yml: Multi-container Docker setup
- @lefthook.yml: Git hooks configuration
- @.env: Environment variables
- @CLAUDE.md: AI assistant instructions (symlink to AGENTS.md)
- @AGENTS.md: Main project rules and AI configuration

## donaction-frontend (Next.js)

### Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript 5
- **UI**: React 18, TailwindCSS 3, PrimeReact 10
- **State**: Redux Toolkit 2
- **Auth**: NextAuth 4
- **Styling**: Sass, Tailwind
- **Payments**: Stripe

### Directory Structure
- `src/app`: Next.js App Router routes and pages
  - `(main)`: Main application routes
  - `(auth)`: Authentication routes
  - `[slug]`: Dynamic slug routes
  - `api`: API routes
- `src/core`: Core business logic
  - `hooks`: Custom React hooks
  - `services`: API services
  - `store`: Redux store configuration
  - `models`: Data models
  - `types`: TypeScript type definitions
  - `constants`: Application constants
  - `enum`: Enumerations
  - `helpers`: Utility functions
- `src/layouts`: Layout components
  - `partials`: Reusable layout parts
  - `components`: Layout-specific components
- `src/config`: Configuration files
- `src/styles`: Global styles and themes
- `src/types`: Shared TypeScript types
- `public`: Static assets
- `scripts`: Build and utility scripts

### Config Files
- @donaction-frontend/next.config.js: Next.js configuration
- @donaction-frontend/tailwind.config.js: TailwindCSS configuration
- @donaction-frontend/postcss.config.js: PostCSS configuration
- @donaction-frontend/tsconfig.json: TypeScript configuration
- @donaction-frontend/package.json: Dependencies and scripts

## donaction-api (Strapi)

### Tech Stack
- **Framework**: Strapi 5
- **Language**: TypeScript 5
- **Database**: PostgreSQL via `pg` 8
- **Media**: ImageKit via custom provider
- **Email**: Nodemailer, Sendinblue API
- **PDF**: pdf-lib, pdf2pic
- **Payments**: Stripe 17

### Directory Structure
- `src/api`: API endpoints per entity
  - `klubr`: Main Klubr entity
  - `klub-projet`: Project management
  - `klub-don`: Donation management
  - `klubr-donateur`: Donor management
  - `klubr-membre`: Member management
  - `klubr-subscription`: Subscription management
  - `invoice`: Invoice generation
  - `blog`: Blog posts
  - `contact`: Contact forms
  - `newsletter`: Newsletter management
- `src/components`: Strapi components
  - `composant-atoms`: Atomic components
  - `club-presentation`: Club presentation blocks
  - `page-sections`: Page section components
  - `club-header`: Club header components
  - `club-chiffres`: Club statistics components
- `src/helpers`: Utility functions
  - `gcc`: Google Cloud Console integrations
  - `emails`: Email templates and sending
  - `klubrPDF`: PDF generation logic
  - `users-extensions`: User permission extensions
- `src/extensions`: Strapi extensions
  - `users-permissions`: Custom user permissions
- `src/plugins`: Custom Strapi plugins
  - `custom-upload`: Custom upload handling
- `src/middlewares`: Custom middlewares
- `src/admin`: Admin panel customizations
- `config`: Strapi configuration files
- `database`: Database schemas and migrations
- `public`: Public uploads
- `private-pdf`: Private PDF storage
- `data`: Database exports
- `types`: TypeScript type definitions

### Config Files
- @donaction-api/package.json: Dependencies and scripts
- @donaction-api/tsconfig.json: TypeScript configuration
- @donaction-api/donaction-gcc-config.json: Google Cloud Console config

## donaction-admin (Angular)

### Tech Stack
- **Framework**: Angular 19
- **Language**: TypeScript 5
- **UI**: PrimeNG 19, TailwindCSS 3
- **State**: NgRx 19
- **Maps**: Google Maps API
- **Auth**: Social login via angularx-social-login
- **Editor**: ngx-editor 18
- **Testing**: Jasmine 5, Karma 6

### Directory Structure
- `src/app`: Angular application
  - `routes`: Route configurations
  - `shared`: Shared components and services
- `src/assets`: Static assets
  - `images`: Image files
  - `animations`: Lottie animations
  - `layout`: Layout-specific assets
  - `theme`: Theme files
  - `prime-ng`: PrimeNG customizations
  - `videos`: Video files
  - `pdf`: PDF documents
- `src/public`: Public static files
  - `icons`: Icon assets
- `src/environments`: Environment configurations

### Config Files
- @donaction-admin/angular.json: Angular workspace configuration
- @donaction-admin/tsconfig.json: TypeScript configuration
- @donaction-admin/package.json: Dependencies and scripts
- @donaction-admin/proxy.conf.json: Proxy configuration for development
- @donaction-admin/ngsw-config.json: Service worker configuration

## donaction-saas (Svelte)

### Tech Stack
- **Framework**: Svelte 5 (Web Components)
- **Language**: TypeScript 5
- **Build**: Vite 5
- **Testing**: Vitest 2
- **Styling**: Sass
- **Payments**: Stripe JS 4
- **Animations**: Lottie Web 5
- **Carousel**: Swiper 11

### Directory Structure
- `src/components`: Svelte components
  - `sponsorshipForm`: Sponsorship form component
- `src/utils`: Utility functions
  - `richTextBlock`: Rich text rendering
  - `share`: Social sharing utilities
  - `lottie`: Lottie animation helpers
  - `tooltip`: Tooltip utilities
- `src/types`: TypeScript types
  - `sponsorshipForm`: Form type definitions
- `src/styles`: Global styles
- `src/assets`: Static assets
  - `animations`: Lottie animations
  - `icons`: SVG icons
  - `fonts`: Custom fonts
  - `docs`: Documentation files

### Config Files
- @donaction-saas/vite.config.ts: Vite build configuration
- @donaction-saas/vite.config.development.ts: Development configuration
- @donaction-saas/svelte.config.js: Svelte configuration
- @donaction-saas/tsconfig.json: TypeScript configuration
- @donaction-saas/package.json: Dependencies and scripts

## AIDD Structure

- **sub-agents**: Specialized AI agent definitions
- **prompts**: AI prompt templates
- **templates**: Code generation templates
- **supports**: Support files and documentation
- **assets**: Asset files for AI operations

## Docs Structure

- **agents**: Agent configuration and documentation
- **rules**: Development rules and guidelines
- **flows**: Development workflow documentation
- **memory-bank**: Project memory and context
- **prompts**: Custom prompt templates
- **tasks**: Task definitions and tracking
- **logs**: Operation logs
