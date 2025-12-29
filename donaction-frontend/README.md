# Donaction Frontend

Public-facing donation platform built with Next.js 14 (App Router).

## Stack

- **Next.js 14** - App Router, Server Components
- **TypeScript 5** - Strict mode
- **TailwindCSS 3** - Styling
- **PrimeReact 10** - UI components
- **Redux Toolkit 2** - State management
- **NextAuth 4** - Authentication
- **Stripe 14** - Payment processing

## Prerequisites

- Node.js >= 18.0.0
- Yarn 1.22.x

## Setup

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Start development server (port 3100)
yarn dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with inspector |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn format` | Format with Prettier |

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (main)/            # Public routes
│   ├── [slug]/            # Dynamic club pages
│   └── api/               # API routes
├── core/
│   ├── services/          # API layer
│   ├── store/modules/     # Redux slices
│   ├── models/            # TypeScript types
│   ├── hooks/             # Custom hooks
│   └── helpers/           # Utilities
└── layouts/
    ├── partials/          # Page sections
    └── components/        # Reusable UI
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Strapi API URL |
| `NEXTAUTH_URL` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe server key |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_RECAPTCHA_KEY` | reCAPTCHA site key |

## Key Features

- Club discovery and search
- Donation flows (one-time, recurring)
- Stripe payment integration
- User authentication (Google OAuth, credentials)
- Donor dashboard
- Tax receipt generation

## Documentation

- `CLAUDE.md` - AI development context
- `docs/FORMS.md` - Form patterns
- `docs/BACKEND_COMMUNICATION.md` - API integration

v1
