alter table shared_leagues add column if not exists head_to_head boolean not null default false;

create table if not exists league_messages (
  id text primary key,
  code text not null references shared_leagues(code) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists league_messages_code_created on league_messages (code, created_at);
