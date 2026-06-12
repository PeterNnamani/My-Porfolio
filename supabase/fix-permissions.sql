-- Run this if chat send/receive fails or you see "policy already exists"
-- Supabase → SQL Editor → New query → paste ALL → Run
-- (Safe to re-run)

grant usage on schema public to anon, authenticated;
grant all on nexus_hub_conversations to anon, authenticated;
grant all on nexus_hub_messages to anon, authenticated;

-- Re-apply policies if missing
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

do $$ begin
  alter publication supabase_realtime add table nexus_hub_messages;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table nexus_hub_conversations;
exception when duplicate_object then null;
end $$;
