create table if not exists turn_alerts (
  code text not null,
  name text not null,
  email text not null,
  last_key text not null default '',
  primary key (code, name)
);
