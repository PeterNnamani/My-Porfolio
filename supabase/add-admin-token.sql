-- Run once if tables already exist (adds magic reply link support)
alter table nexus_hub_conversations add column if not exists admin_token text;
create index if not exists idx_nexus_hub_conversations_token on nexus_hub_conversations(admin_token);
