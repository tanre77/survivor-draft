create table if not exists league_reports (
  id text primary key,
  code text not null,
  message_id text,
  author text not null,
  reporter text not null,
  reason text not null,
  excerpt text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists support_requests (
  id text primary key,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
