-- Run once to ensure chat + email reply flow works
-- Supabase → SQL Editor → Run

alter table nexus_hub_conversations add column if not exists admin_token text;
create index if not exists idx_nexus_hub_conversations_token on nexus_hub_conversations(admin_token);

grant usage on schema public to anon, authenticated;
grant all on nexus_hub_conversations to anon, authenticated;
grant all on nexus_hub_messages to anon, authenticated;

alter table nexus_hub_conversations enable row level security;
alter table nexus_hub_messages enable row level security;

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
