create table if not exists shared_leagues (
  code text primary key,
  name text not null,
  bonus boolean not null default false,
  trades boolean not null default false,
  drafting boolean not null default true,
  seats jsonb not null,
  updated_at timestamptz not null default now()
);
