-- Tarefas, notas e projetos (cada linha pertence a um usuário)
create table if not exists public.items (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('task','note','project')),
  data jsonb not null default '{}'::jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists items_user_updated on public.items (user_id, updated_at);

-- Lembretes que o servidor envia como notificação
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  task_id text not null,
  title text not null,
  remind_at timestamptz not null,
  sent_at timestamptz
);
create index if not exists reminders_due on public.reminders (remind_at) where sent_at is null;

-- Aparelhos que podem receber notificação
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Segurança: cada pessoa só vê e altera os próprios dados
alter table public.items enable row level security;
alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "own items" on public.items;
create policy "own items" on public.items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "own reminders" on public.reminders;
create policy "own reminders" on public.reminders
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "own subscriptions" on public.push_subscriptions;
create policy "own subscriptions" on public.push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Sincronização ao vivo entre aparelhos
do $$ begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null; end $$;
