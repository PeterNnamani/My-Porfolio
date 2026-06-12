-- Nexus Hub chat tables (separate from any existing tables in your project)
-- Run in Supabase → SQL Editor → New query → Run

create table if not exists nexus_hub_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  visitor_name text not null default '',
  visitor_email text not null default '',
  topic text not null default 'General Inquiry',
  status text not null default 'open' check (status in ('open', 'closed')),
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

alter table nexus_hub_conversations enable row level security;
alter table nexus_hub_messages enable row level security;

create policy "nexus_hub read conversations" on nexus_hub_conversations for select using (true);
create policy "nexus_hub insert conversations" on nexus_hub_conversations for insert with check (true);
create policy "nexus_hub update conversations" on nexus_hub_conversations for update using (true);

create policy "nexus_hub read messages" on nexus_hub_messages for select using (true);
create policy "nexus_hub insert messages" on nexus_hub_messages for insert with check (true);

-- Permissions for anon/authenticated roles (required for browser chat)
grant usage on schema public to anon, authenticated;
grant all on nexus_hub_conversations to anon, authenticated;
grant all on nexus_hub_messages to anon, authenticated;

-- Realtime: if this errors, enable manually in Dashboard → Database → Replication
alter publication supabase_realtime add table nexus_hub_messages;
alter publication supabase_realtime add table nexus_hub_conversations;
