-- Nexus Hub chat tables (safe to re-run — policies are dropped and recreated)
-- Run in Supabase → SQL Editor → New query → Run
-- If you only need to fix permissions, use fix-permissions.sql instead

create table if not exists nexus_hub_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  visitor_name text not null default '',
  visitor_email text not null default '',
  topic text not null default 'General Inquiry',
  status text not null default 'open' check (status in ('open', 'closed')),
  admin_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists nexus_hub_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references nexus_hub_conversations(id) on delete cascade,
  sender text not null check (sender in ('user', 'admin', 'bot')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_nexus_hub_conversations_visitor on nexus_hub_conversations(visitor_id);
create index if not exists idx_nexus_hub_conversations_status on nexus_hub_conversations(status);
create index if not exists idx_nexus_hub_messages_conversation on nexus_hub_messages(conversation_id);

alter table nexus_hub_conversations add column if not exists admin_token text;
create index if not exists idx_nexus_hub_conversations_token on nexus_hub_conversations(admin_token);

alter table nexus_hub_conversations enable row level security;
alter table nexus_hub_messages enable row level security;

-- Safe to re-run: drop then recreate policies
drop policy if exists "nexus_hub read conversations" on nexus_hub_conversations;
drop policy if exists "nexus_hub insert conversations" on nexus_hub_conversations;
drop policy if exists "nexus_hub update conversations" on nexus_hub_conversations;
drop policy if exists "nexus_hub read messages" on nexus_hub_messages;
drop policy if exists "nexus_hub insert messages" on nexus_hub_messages;

create policy "nexus_hub read conversations" on nexus_hub_conversations for select using (true);
create policy "nexus_hub insert conversations" on nexus_hub_conversations for insert with check (true);
create policy "nexus_hub update conversations" on nexus_hub_conversations for update using (true);

create policy "nexus_hub read messages" on nexus_hub_messages for select using (true);
create policy "nexus_hub insert messages" on nexus_hub_messages for insert with check (true);

-- Permissions for anon/authenticated roles (required for browser chat)
grant usage on schema public to anon, authenticated;
grant all on nexus_hub_conversations to anon, authenticated;
grant all on nexus_hub_messages to anon, authenticated;

-- Realtime (skip if already added — enable in Dashboard → Database → Replication if needed)
do $$ begin
  alter publication supabase_realtime add table nexus_hub_messages;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table nexus_hub_conversations;
exception when duplicate_object then null;
end $$;
