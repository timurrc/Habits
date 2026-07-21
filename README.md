# Habits

Трекер привычек на Next.js + Supabase.

## Setup

1. Создай проект на [supabase.com](https://supabase.com).
2. В SQL Editor выполни [`supabase/schema.sql`](./supabase/schema.sql).
3. Скопируй `.env.local.example` → `.env.local` и заполни:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

4. Запуск:

```bash
npm install
npm run dev
```

## Deploy (Vercel)

Импортируй репозиторий, добавь те же две env-переменные, Deploy.

## Stack

- Next.js 16 (App Router, `proxy.ts` для сессии)
- Tailwind CSS v4
- Radix UI / shadcn-style
- Framer Motion
- Zustand (клиентский кэш привычек + UI)
- Supabase Auth + Postgres (RLS)

## Routes

| Path               |                          |
| ------------------ | ------------------------ |
| `/login` `/signup` | Auth                     |
| `/onboarding`      | Выбор стартовых привычек |
| `/today`           | Чек-ины на сегодня       |
| `/habits`          | CRUD                     |
| `/stats`           | Heatmap и стрики         |
| `/settings`        | Профиль и тема           |
