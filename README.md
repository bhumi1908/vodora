# Vodora Frontend

Next.js app for the Vodora platform — verified professional references, candidate profiles, and recruiter tools.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (auth and data)

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project ([create one free](https://supabase.com/dashboard))

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API** in the Supabase dashboard.

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Start dev server with hot reload     |
| `npm run build`| Production build                     |
| `npm run start`| Serve production build               |
| `npm run lint` | Run ESLint                           |

## Project structure

```
src/
├── app/              # Routes (App Router)
├── components/       # UI by feature (auth, landing, layout, …)
└── lib/
    ├── env.ts        # Environment variable helpers
    └── supabase/     # Supabase client, middleware, types
```

## Environment variables

| Variable                         | Required | Description              |
| -------------------------------- | -------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`       | Yes      | Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Yes      | Supabase anon/public key |

Never commit `.env.local` or real keys. `.env.example` is the committed template.

## Supabase connection check (development only)

During local development you can verify Supabase credentials at `/supabase-status` or `GET /api/supabase/status`. These routes are disabled in production.

## Deployment

Build with environment variables set in your host (e.g. Vercel project settings):

```bash
npm run build
npm run start
```
